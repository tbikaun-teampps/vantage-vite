import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProgramById } from "@/hooks/useProgram";
import { createClient } from "@/lib/supabase/client";
import { BRAND_COLORS } from "@/lib/brand";

interface PresiteInterviewsLineChartProps {
  programId: number;
}

interface ChartDataPoint {
  phaseName: string;
  phaseSequence: number;
  averageScore: number;
  responseCount: number;
  interviewCount: number;
}

interface InterviewResponseData {
  id: number;
  rating_score: number | null;
  interview_id: number;
  program_phase_id: number;
  phase_name: string | null;
  phase_sequence: number;
}

export function PresiteInterviewsLineChart({ programId }: PresiteInterviewsLineChartProps) {
  const [responseData, setResponseData] = useState<InterviewResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch program data including phases
  const { data: program, isLoading: programLoading, error: programError } = useProgramById(programId);

  // Get all phases for this program
  const phases = program?.phases || [];

  // Fetch presite interview responses directly from Supabase
  useEffect(() => {
    if (!program || !program.presite_questionnaire_id || phases.length === 0) return;

    const fetchPresiteInterviewResponses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // Fetch all interviews for this program that use the presite questionnaire
        const { data: interviews, error: interviewsError } = await supabase
          .from('interviews')
          .select(`
            id,
            program_phase_id,
            program_phases!inner(
              id,
              name,
              sequence_number
            ),
            interview_responses!inner(
              id,
              rating_score,
              is_applicable
            )
          `)
          .eq('program_id', programId)
          .eq('questionnaire_id', program.presite_questionnaire_id)
          .eq('is_deleted', false)
          .not('interview_responses.rating_score', 'is', null)
          .eq('interview_responses.is_applicable', true)
          .eq('interview_responses.is_deleted', false);

        if (interviewsError) {
          throw interviewsError;
        }

        // Transform the data into a flat array of responses with phase info
        const responses: InterviewResponseData[] = [];
        
        interviews?.forEach(interview => {
          interview.interview_responses.forEach(response => {
            if (response.rating_score !== null) {
              responses.push({
                id: response.id,
                rating_score: response.rating_score,
                interview_id: interview.id,
                program_phase_id: interview.program_phase_id || 0,
                phase_name: interview.program_phases?.name || null,
                phase_sequence: interview.program_phases?.sequence_number || 0,
              });
            }
          });
        });

        setResponseData(responses);
      } catch (error) {
        console.error("Failed to fetch presite interview responses:", error);
        setError(error instanceof Error ? error : new Error("Failed to fetch presite interview responses"));
      } finally {
        setLoading(false);
      }
    };

    fetchPresiteInterviewResponses();
  }, [program, programId, phases]);

  // Transform data for the line chart
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!program || phases.length === 0 || responseData.length === 0) return [];

    // Group responses by phase
    const phaseGroups = new Map<number, InterviewResponseData[]>();
    
    responseData.forEach(response => {
      const phaseId = response.program_phase_id;
      if (!phaseGroups.has(phaseId)) {
        phaseGroups.set(phaseId, []);
      }
      phaseGroups.get(phaseId)!.push(response);
    });

    // Calculate averages for each phase
    return phases
      .sort((a, b) => a.sequence_number - b.sequence_number)
      .map(phase => {
        const phaseResponses = phaseGroups.get(phase.id) || [];
        
        // Calculate average score for this phase
        const scores = phaseResponses
          .map(r => r.rating_score)
          .filter((score): score is number => score !== null);
        
        const averageScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;

        // Count unique interviews for this phase
        const uniqueInterviews = new Set(phaseResponses.map(r => r.interview_id)).size;

        return {
          phaseName: phase.name || `Phase ${phase.sequence_number}`,
          phaseSequence: phase.sequence_number,
          averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
          responseCount: phaseResponses.length,
          interviewCount: uniqueInterviews,
        };
      });
  }, [program, phases, responseData]);

  if (programLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading program data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (programError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load program data: {programError.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!program?.presite_questionnaire_id) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Presite Questionnaire</AlertTitle>
            <AlertDescription>
              This program doesn't have a presite questionnaire configured. Configure one to see presite interview trends.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading interview responses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load interview responses: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (phases.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Phases Found</AlertTitle>
            <AlertDescription>
              This program doesn't have any phases yet. Create phases to see interview trends over time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (responseData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Interview Data</AlertTitle>
            <AlertDescription>
              No presite interview responses found for this program's phases. Complete presite interviews to see trend data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalResponses = responseData.length;
  const totalInterviews = new Set(responseData.map(r => r.interview_id)).size;
  const overallAverage = responseData.length > 0 
    ? responseData
        .map(r => r.rating_score)
        .filter((score): score is number => score !== null)
        .reduce((sum, score, _, arr) => sum + score / arr.length, 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Presite Interview Trends
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Average response scores across program phases
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {totalInterviews} Interview{totalInterviews !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalResponses} Response{totalResponses !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Avg: {Math.round(overallAverage * 100) / 100}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="phaseName"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                formatter={(value: any, name: string) => {
                  if (name === 'averageScore') {
                    return [value, 'Average Score'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label: string) => `Phase: ${label}`}
                payload={chartData.map((point, index) => ({
                  color: BRAND_COLORS.royalBlue,
                  dataKey: 'averageScore',
                  value: point.averageScore,
                  payload: {
                    ...point,
                    additionalInfo: `${point.interviewCount} interviews, ${point.responseCount} responses`
                  }
                }))}
              />
              <Legend />
              
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke={BRAND_COLORS.royalBlue}
                strokeWidth={2}
                dot={{ fill: BRAND_COLORS.royalBlue, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: BRAND_COLORS.royalBlue, strokeWidth: 2 }}
                name="Average Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
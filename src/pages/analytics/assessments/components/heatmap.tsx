import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Filter, Maximize, Minimize } from "lucide-react";
import { Link } from "react-router-dom";
import { IconExternalLink } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BRAND_COLORS } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LabelWithInfo } from "@/components/ui/label-with-info";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import MultiSelect from "@/pages/questionnaires/components/questions/multi-select";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import {
  getOverallHeatmap,
  getOverallHeatmapFilters,
} from "@/lib/api/analytics";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

interface AssessmentHeatmapProps {
  assessmentId?: string;
}

type HeatmapMetric = "average_score" | "total_interviews" | "completion_rate" | "total_actions";

interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
  sampleSize: number;
  metadata: any;
}

interface HeatmapApiResponse {
  xLabels: string[];
  yLabels: string[];
  metrics: {
    [K in HeatmapMetric]: {
      data: HeatmapDataPoint[];
      values: number[];
    };
  };
  config: {
    xAxis: string;
    yAxis: string;
    questionnaireId: number;
    assessmentId: number | null;
  };
}

interface HeatmapFilters {
  questionnaires: { id: number; name: string; assessmentIds: number[] }[];
  assessments: { id: number; name: string; questionnaireId: number }[];
  axes: { value: string; category: string; order: number }[];
  metrics: string[];
}

export default function AssessmentHeatmap({
  assessmentId: propAssessmentId,
}: AssessmentHeatmapProps) {
  const routes = useCompanyRoutes();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(
    propAssessmentId ? parseInt(propAssessmentId) : null
  );
  const [selectedMetric, setSelectedMetric] = useState<HeatmapMetric>("average_score");
  const [xAxis, setXAxis] = useState<string>("business_unit");
  const [yAxis, setYAxis] = useState<string>("role");
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New organizational filtering state
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(
    []
  );
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({
    width: 800,
    height: 500,
  });

  const [apiData, setApiData] = useState<HeatmapApiResponse | null>(null);
  const [filters, setFilters] = useState<HeatmapFilters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = useCompanyFromUrl();

  // Fetch filters on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await getOverallHeatmapFilters(companyId);
        if (!response) return;
        setFilters(response);

        // Set default questionnaire to first one if available
        if (response.questionnaires.length > 0 && !selectedQuestionnaire) {
          setSelectedQuestionnaire(response.questionnaires[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch filters:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch filters");
      }
    };
    fetchFilters();
  }, [companyId]);

  // Fetch heatmap data when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedQuestionnaire) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await getOverallHeatmap(
          companyId,
          selectedQuestionnaire,
          selectedAssessmentId ?? undefined,
          xAxis as any,
          yAxis as any
        );

        if (!response) return;
        console.log("Heatmap response:", response);
        setApiData(response);

        // Sync UI state with config from response (in case defaults were applied)
        if (response.config) {
          if (response.config.xAxis !== xAxis) {
            setXAxis(response.config.xAxis);
          }
          if (response.config.yAxis !== yAxis) {
            setYAxis(response.config.yAxis);
          }
        }
      } catch (err) {
        console.error("Failed to fetch heatmap:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch heatmap data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId, selectedQuestionnaire, selectedAssessmentId, xAxis, yAxis]);

  // Update SVG dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Account for padding (p-6 = 24px on each side)
        const width = rect.width - 48;
        const height = rect.height - 48;
        setSvgDimensions({
          width: Math.max(400, width),
          height: Math.max(300, height),
        });
      }
    };

    // Delay update to allow sidebar transition to complete
    const timeoutId = setTimeout(updateDimensions, 100);

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [isSidebarOpen]); // Add isSidebarOpen as dependency

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!cardRef.current) return;

      if (!document.fullscreenElement) {
        await cardRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // Auto-close sidebar in fullscreen for more space
      if (isNowFullscreen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // D3 Heatmap rendering
  useEffect(() => {
    if (!svgRef.current || !apiData) return;

    // Get current metric data
    const currentMetricData = apiData.metrics[selectedMetric];

    const renderHeatmap = () => {
      if (!svgRef.current) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous render

      // Get actual container dimensions
      const containerRect = containerRef.current?.getBoundingClientRect();
      const containerWidth = containerRect ? containerRect.width - 48 : 800; // Account for p-6 padding (24px each side)
      const containerHeight = containerRect ? containerRect.height - 48 : 500;

      // Simple margins
      const margin = {
        top: 40,
        right: 40,
        bottom: 80,
        left: 150,
      };

      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Update SVG dimensions
      svg.attr("width", containerWidth).attr("height", containerHeight);

      // Create zoom behavior
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 3]) // Allow zoom from 50% to 300%
        .on("zoom", (event) => {
          const { transform } = event;
          zoomGroup.attr("transform", transform);
        });

      // Apply zoom to SVG
      svg.call(zoom);

      // Add zoom controls
      const controls = svg
        .append("g")
        .attr("class", "zoom-controls")
        .attr("transform", `translate(${containerWidth - 80}, 10)`);

      // Reset zoom button
      controls
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 70)
        .attr("height", 25)
        .attr("rx", 4)
        .style("fill", "rgba(0,0,0,0.7)")
        .style("cursor", "pointer")
        .on("click", () => {
          svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        });

      controls
        .append("text")
        .attr("x", 35)
        .attr("y", 17)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("pointer-events", "none")
        .text("Reset Zoom");

      // Add zoom instructions (subtle hint)
      const instructions = svg
        .append("g")
        .attr("class", "zoom-instructions")
        .attr("transform", `translate(10, ${containerHeight - 20})`);

      instructions
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("fill", "currentColor")
        .style("font-size", "10px")
        .style("opacity", "0.6")
        .style("pointer-events", "none")
        .text("💡 Scroll to zoom, drag to pan");

      // Create main group that will be zoomed/panned
      const zoomGroup = svg.append("g").attr("class", "zoom-group");

      const g = zoomGroup
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales - cells will automatically scale to fill available space
      const xScale = d3
        .scaleBand()
        .domain(apiData.xLabels)
        .range([0, width])
        .padding(0.1);

      const yScale = d3
        .scaleBand()
        .domain(apiData.yLabels)
        .range([0, height])
        .padding(0.1);

      // Create custom brand color interpolator
      const brandColorInterpolator = (t: number) => {
        // Create a smooth gradient from dark to bright using brand colors
        if (t < 0.25) {
          return d3.interpolate(
            BRAND_COLORS.luckyPoint,
            BRAND_COLORS.royalBlue
          )(t * 4);
        } else if (t < 0.5) {
          return d3.interpolate(
            BRAND_COLORS.royalBlue,
            BRAND_COLORS.mediumPurple
          )((t - 0.25) * 4);
        } else if (t < 0.75) {
          return d3.interpolate(
            BRAND_COLORS.mediumPurple,
            BRAND_COLORS.malibu
          )((t - 0.5) * 4);
        } else {
          return d3.interpolate(
            BRAND_COLORS.malibu,
            BRAND_COLORS.cyan
          )((t - 0.75) * 4);
        }
      };

      // Filter out null values for color scale domain
      const validValues = currentMetricData.values.filter(v => v !== null && v !== undefined);
      const colorScale = d3
        .scaleSequential()
        .interpolator(brandColorInterpolator)
        .domain(d3.extent(validValues) as [number, number]);

      // Create heatmap cells
      g.selectAll(".cell")
        .data(currentMetricData.data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d) => xScale(d.x) || 0)
        .attr("y", (d) => yScale(d.y) || 0)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", (d) => {
          // Handle null values with a neutral gray color
          if (d.value === null || d.value === undefined) {
            return "#e0e0e0";
          }
          return colorScale(d.value);
        })
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          // Tooltip logic
          const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "heatmap-tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.8)")
            .style("color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000");

          const valueText = d.value === null || d.value === undefined
            ? "N/A"
            : d.value.toFixed(1);

          tooltip
            .html(`${d.x} × ${d.y}<br/>Value: ${valueText}`)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.selectAll(".heatmap-tooltip").remove();
        });

      // Add text labels to show values in cells
      g.selectAll(".cell-text")
        .data(currentMetricData.data)
        .enter()
        .append("text")
        .attr("class", "cell-text")
        .attr("x", (d) => (xScale(d.x) || 0) + xScale.bandwidth() / 2)
        .attr("y", (d) => (yScale(d.y) || 0) + yScale.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", (d) => {
          // Use white text for dark colors, dark text for light colors
          const color = d3.color(colorScale(d.value));
          if (color) {
            const hsl = d3.hsl(color);
            return hsl.l < 0.5 ? "#ffffff" : "#000000";
          }
          return "#000000";
        })
        .style("pointer-events", "none") // Don't interfere with cell hover
        .text((d) => {
          // Handle null/undefined values
          if (d.value === null || d.value === undefined) {
            return "N/A";
          }

          // Format the value based on selected metric
          if (selectedMetric === "completion_rate") {
            return `${(d.value).toFixed(0)}%`;
          } else if (
            selectedMetric === "total_interviews" ||
            selectedMetric === "total_actions"
          ) {
            return d.value.toString();
          } else {
            return d.value.toFixed(1);
          }
        });

      // X axis labels (with word wrapping for long labels)
      g.selectAll(".x-label-group")
        .data(apiData.xLabels)
        .enter()
        .append("g")
        .attr("class", "x-label-group")
        .each(function (d) {
          const group = d3.select(this);
          const xPos = (xScale(d) || 0) + xScale.bandwidth() / 2;
          const lineHeight = 12; // Approximate line height for 12px font

          // Split long labels into multiple lines
          // Use a simple heuristic: if label is longer than 12 characters, try to split
          let lines: string[] = [];
          if (d.length > 12) {
            // Try to split on spaces first
            const words = d.split(" ");
            if (words.length > 1) {
              // Group words to make reasonable line lengths
              let currentLine = "";
              words.forEach((word, index) => {
                if (currentLine.length === 0) {
                  currentLine = word;
                } else if ((currentLine + " " + word).length <= 12) {
                  currentLine += " " + word;
                } else {
                  lines.push(currentLine);
                  currentLine = word;
                }

                // Add the last line
                if (index === words.length - 1) {
                  lines.push(currentLine);
                }
              });
            } else {
              // No spaces, try to split at reasonable points
              const halfLength = Math.ceil(d.length / 2);
              lines = [d.substring(0, halfLength), d.substring(halfLength)];
            }
          } else {
            lines = [d];
          }

          // Calculate starting y position to center the text block
          const totalHeight = lines.length * lineHeight;
          const startY = height + 20 - totalHeight / 2 + lineHeight / 2;

          lines.forEach((line, index) => {
            group
              .append("text")
              .attr("class", "x-label")
              .attr("x", xPos)
              .attr("y", startY + index * lineHeight)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .style("font-size", "12px")
              .style("fill", "currentColor")
              .text(line);
          });
        });

      // Y axis labels (with word wrapping - one word per line)
      g.selectAll(".y-label-group")
        .data(apiData.yLabels)
        .enter()
        .append("g")
        .attr("class", "y-label-group")
        .each(function (d) {
          const group = d3.select(this);
          const words = d.split(" ");
          const yPos = (yScale(d) || 0) + yScale.bandwidth() / 2;
          const lineHeight = 12; // Approximate line height for 12px font

          // Calculate starting y position to center the text block
          const totalHeight = words.length * lineHeight;
          const startY = yPos - totalHeight / 2 + lineHeight / 2;

          words.forEach((word, index) => {
            group
              .append("text")
              .attr("class", "y-label")
              .attr("x", -10)
              .attr("y", startY + index * lineHeight)
              .attr("text-anchor", "end")
              .attr("dominant-baseline", "middle")
              .style("font-size", "12px")
              .style("fill", "currentColor")
              .text(word);
          });
        });
    };

    // Initial render
    renderHeatmap();

    // Cleanup
    return () => {
      d3.selectAll(".heatmap-tooltip").remove();
    };
  }, [apiData, selectedMetric, svgDimensions]);

  const hasData = apiData && apiData.metrics[selectedMetric].data.length > 0;

  if (!apiData || !filters) {
    return (
      <Card className="shadow-none border-none">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-none">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load assessment metrics: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Create the filter sidebar component
  const FilterSidebar = () => (
    <div
      className={`bg-background border-r flex-shrink-0 transition-all duration-300 ${
        isSidebarOpen ? "w-80" : "w-0"
      } overflow-hidden h-full`}
    >
      {isSidebarOpen && (
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {/* Basic Filters */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Basic Filters</h3>

            <div className="space-y-2">
              <LabelWithInfo
                label="Questionnaire"
                tooltip="Choose a specific questionnaire to filter assessments, or select 'All' to include all questionnaires in the analysis."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={selectedQuestionnaire?.toString()}
                onValueChange={(value) => setSelectedQuestionnaire(parseInt(value))}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select questionnaire" />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  {filters.questionnaires.map((q) => (
                    <SelectItem key={q.id} value={q.id.toString()}>
                      {q.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Assessment Scope"
                tooltip="Select a single assessment for detailed analysis, or leave empty to include all assessments."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={selectedAssessmentId?.toString() || "all"}
                onValueChange={(value) => setSelectedAssessmentId(value === "all" ? null : parseInt(value))}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All assessments" />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <SelectItem value="all">
                    All Assessments
                  </SelectItem>
                  {filters.assessments
                    .filter((a) => !selectedQuestionnaire || a.questionnaireId === selectedQuestionnaire)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        <div className="truncate" title={a.name}>
                          {a.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Data Metric"
                tooltip="Choose what data to visualize: Average Score (mean ratings), Total Interviews (count), Total Actions (action items count), or Completion Rate (percentage of completed responses)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={selectedMetric}
                onValueChange={(value) => setSelectedMetric(value as HeatmapMetric)}
                disabled={!selectedQuestionnaire}
              >
                <SelectTrigger className="w-full h-8 text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  {filters.metrics.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Analysis Configuration */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Analysis Configuration</h3>

            {/* <div className="space-y-2">
              <LabelWithInfo
                label="Detail Level"
                tooltip="Set the granularity of analysis: Individual Questions (most detailed), Steps (groups of questions), or Sections (high-level categories)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={questionnaireLevel}
                onValueChange={setQuestionnaireLevel}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent container={isFullscreen ? cardRef.current || undefined : undefined}>
                  <SelectItem value="Question">
                    Individual Questions
                  </SelectItem>
                  <SelectItem value="Step">Steps</SelectItem>
                  <SelectItem value="Section">
                    Sections
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="space-y-2">
              <LabelWithInfo
                label="X-Axis"
                tooltip="Choose what to display horizontally: organizational hierarchy (Business Unit, Site, etc.), Roles, or questionnaire elements (Sections, Steps, Questions)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={xAxis}
                onValueChange={setXAxis}
                disabled={!selectedQuestionnaire}
              >
                <SelectTrigger className="w-full h-8 text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Company Hierarchy
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "company")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                    Questionnaire
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "questionnaire")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Y-Axis"
                tooltip="Choose what to display vertically: organizational hierarchy (Business Unit, Site, etc.), Roles, or questionnaire elements (Sections, Steps, Questions)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={yAxis}
                onValueChange={setYAxis}
                disabled={!selectedQuestionnaire}
              >
                <SelectTrigger className="w-full h-8 text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Company Hierarchy
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "company")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                    Questionnaire
                  </div>
                  {filters.axes
                    .filter((item) => item.category === "questionnaire")
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="capitalize"
                      >
                        {item.value.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organizational Filters */}
          {/* <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Organizational Filters</h3>

            {organizationalData.businessUnits.length > 0 && (
              <div className="space-y-2">
                <LabelWithInfo
                  label="Business Units"
                  tooltip="Filter results to include only selected business units. Leave empty to include all business units in the analysis."
                  isFullscreen={isFullscreen}
                  container={cardRef.current}
                />
                <MultiSelect
                  options={organizationalData.businessUnits}
                  value={selectedBusinessUnits}
                  onChange={setSelectedBusinessUnits}
                  placeholder="All business units"
                />
              </div>
            )}

            {organizationalData.sites.length > 0 && (
              <div className="space-y-2">
                <LabelWithInfo
                  label="Sites"
                  tooltip="Filter results to include only selected sites/locations. Leave empty to include all sites in the analysis."
                  isFullscreen={isFullscreen}
                  container={cardRef.current}
                />
                <MultiSelect
                  options={organizationalData.sites}
                  value={selectedSites}
                  onChange={setSelectedSites}
                  placeholder="All sites"
                />
              </div>
            )}

            {organizationalData.roles.length > 0 && (
              <div className="space-y-2">
                <LabelWithInfo
                  label="Roles"
                  tooltip="Filter results to include only selected job roles/positions. Leave empty to include all roles in the analysis."
                  isFullscreen={isFullscreen}
                  container={cardRef.current}
                />
                <MultiSelect
                  options={organizationalData.roles}
                  value={selectedRoles}
                  onChange={setSelectedRoles}
                  placeholder="All roles"
                />
              </div>
            )}
          </div> */}
        </div>
      )}
    </div>
  );

  return (
    <Card
      ref={cardRef}
      className={`h-full relative p-0 overflow-hidden shadow-none border-none rounded-none ${
        isFullscreen ? "bg-background" : ""
      }`}
    >
      <div className="h-full w-full min-h-[500px] flex">
        <div data-tour="analytics-heatmap-filters">
          <FilterSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Header Controls */}
          <div className="flex justify-between items-center border-b bg-background/50 p-4 gap-4">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="p-2"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Toggle filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="p-2"
                      data-tour="analytics-heatmap-fullscreen"
                    >
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">
                      {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Data Summary Bar */}
            <div className="flex-1">
              <div className="flex gap-1 flex-wrap">
                {selectedQuestionnaire && filters && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {filters.questionnaires.find(q => q.id === selectedQuestionnaire)?.name}
                  </Badge>
                )}
                {selectedAssessmentId && filters && (
                  <Link
                    to={routes.assessmentOnsiteDetail(selectedAssessmentId.toString())}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs hover:bg-secondary/80 transition-colors cursor-pointer inline-flex items-center gap-1 flex-shrink-0"
                    >
                      {filters.assessments.find(a => a.id === selectedAssessmentId)?.name}
                      <IconExternalLink className="h-2.5 w-2.5" />
                    </Badge>
                  </Link>
                )}

                {/* Organizational Filter Badges */}
                {selectedBusinessUnits.length > 0 && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {selectedBusinessUnits.length} BU
                    {selectedBusinessUnits.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {selectedSites.length > 0 && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {selectedSites.length} Site
                    {selectedSites.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {selectedRoles.length > 0 && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {selectedRoles.length} Role
                    {selectedRoles.length > 1 ? "s" : ""}
                  </Badge>
                )}

                <Badge variant="outline" className="text-xs flex-shrink-0 capitalize">
                  {selectedMetric.replaceAll("_", " ")}
                </Badge>
                <Badge variant="outline" className="text-xs flex-shrink-0 capitalize">
                  {xAxis.replaceAll("_", " ")} × {yAxis.replaceAll("_", " ")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Heatmap Content */}
          <div className="flex-1 flex justify-center items-center">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Loading metrics...
                  </p>
                </div>
              </div>
            ) : hasData ? (
              <div ref={containerRef} className="w-full h-full p-6">
                <svg
                  ref={svgRef}
                  className="w-full h-full"
                  style={{ display: "block" }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Alert className="max-w-md border-0 bg-background/80 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Data Available</AlertTitle>
                  <AlertDescription>
                    {!selectedQuestionnaire
                      ? "Please select a questionnaire from the dropdown to view heatmap data."
                      : "No data found for the selected filters. Please ensure interviews have been completed with responses."}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

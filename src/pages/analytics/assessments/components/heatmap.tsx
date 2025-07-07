import { useState, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalyticsStore } from "@/stores/analytics-store";
import { AlertCircle, Loader2, Filter, Maximize, Minimize } from "lucide-react";
import { assessmentService } from "@/lib/supabase/assessment-service";
import { Link } from "react-router-dom";
import { IconExternalLink } from "@tabler/icons-react";
import type { AssessmentWithCounts } from "@/types/assessment";
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
import MultiSelect from "@/pages/assessments/onsite/questionnaires/components/multi-select";

interface AssessmentHeatmapProps {
  assessmentId?: string;
}

// Enhanced organizational filtering function
function transformOrganizationalData(
  assessments: any[],
  assessmentMetrics: Record<string, any>,
  xAxis: string,
  yAxis: string,
  dataType: string,
  organizationalFilters: {
    businessUnits: string[];
    sites: string[];
    roles: string[];
  }
) {
  const crossData: Array<{ x: string; y: string; value: number }> = [];

  // Get all assessments that have metrics loaded
  const assessmentsWithMetrics = assessments.filter(
    (a) => assessmentMetrics[a.id]
  );

  if (assessmentsWithMetrics.length === 0) {
    return { data: [], xLabels: [], yLabels: [], values: [] };
  }

  // Helper to get dimension value with organizational context
  const getDimensionValue = (
    dimension: string,
    response: any,
    metrics: any,
    assessmentName: string
  ) => {
    switch (dimension) {
      case "Assessment":
        return assessmentName;
      case "Role":
        return (
          response.role?.shared_roles?.name || response.role?.name || "Unknown"
        );
      case "Question":
        return response.question?.title || "Unknown";
      case "Step":
        return response.question?.step || "Unknown";
      case "Section":
        return response.question?.section || "Unknown";
      case "Site":
        return metrics.hierarchy.site?.name || "Unknown";
      case "Region":
        return metrics.hierarchy.region?.name || "Unknown";
      case "Business Unit":
        return metrics.hierarchy.business_unit?.name || "Unknown";
      case "Asset Group":
        return metrics.hierarchy.asset_group?.name || "Unknown";
      default:
        return "Unknown";
    }
  };

  // Helper to check if response passes organizational filters
  const passesOrganizationalFilters = (response: any, metrics: any) => {
    // Business Unit filter
    if (organizationalFilters.businessUnits.length > 0) {
      const bu = metrics.hierarchy.business_unit?.name;
      if (!bu || !organizationalFilters.businessUnits.includes(bu)) {
        return false;
      }
    }

    // Site filter
    if (organizationalFilters.sites.length > 0) {
      const site = metrics.hierarchy.site?.name;
      if (!site || !organizationalFilters.sites.includes(site)) {
        return false;
      }
    }

    // Role filter
    if (organizationalFilters.roles.length > 0) {
      const role = response.role?.shared_roles?.name || response.role?.name;
      if (!role || !organizationalFilters.roles.includes(role)) {
        return false;
      }
    }

    return true;
  };

  // Group data by X and Y dimensions with organizational filtering
  const groupedData: Record<string, Record<string, number[]>> = {};

  assessmentsWithMetrics.forEach((assessment) => {
    const metrics = assessmentMetrics[assessment.id];
    if (!metrics || !metrics.raw_responses) return;

    metrics.raw_responses.forEach((response: any) => {
      // Apply organizational filters
      if (!passesOrganizationalFilters(response, metrics)) {
        return;
      }

      const xVal = getDimensionValue(xAxis, response, metrics, assessment.name);
      const yVal = getDimensionValue(yAxis, response, metrics, assessment.name);

      if (!groupedData[xVal]) {
        groupedData[xVal] = {};
      }
      if (!groupedData[xVal][yVal]) {
        groupedData[xVal][yVal] = [];
      }

      groupedData[xVal][yVal].push(response.rating_score);
    });
  });

  // Calculate metrics for each combination
  Object.entries(groupedData).forEach(([xVal, yGroups]) => {
    Object.entries(yGroups).forEach(([yVal, scores]) => {
      let value = 0;

      switch (dataType) {
        case "Average Score":
          value = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          break;
        case "Total Interviews":
          // Count unique interviews for this combination
          const uniqueInterviews = new Set();
          assessmentsWithMetrics.forEach((assessment) => {
            const metrics = assessmentMetrics[assessment.id];
            if (metrics?.raw_responses) {
              metrics.raw_responses
                .filter(
                  (r: any) =>
                    passesOrganizationalFilters(r, metrics) &&
                    getDimensionValue(xAxis, r, metrics, assessment.name) ===
                      xVal &&
                    getDimensionValue(yAxis, r, metrics, assessment.name) ===
                      yVal
                )
                .forEach((r: any) =>
                  uniqueInterviews.add(`${assessment.id}-${r.interview_id}`)
                );
            }
          });
          value = uniqueInterviews.size;
          break;
        case "Completion Rate":
          // Calculate completion rate as percentage of questions answered per interview
          const orgInterviewCompletions: Record<
            string,
            { answered: number; total: number }
          > = {};

          // Collect all responses for this combination with organizational filtering
          assessmentsWithMetrics.forEach((assessment) => {
            const metrics = assessmentMetrics[assessment.id];
            if (metrics?.raw_responses) {
              // Get total questions for this assessment
              const totalQuestions = metrics.raw_responses.reduce(
                (acc: Set<number>, r: any) => {
                  acc.add(r.question_id);
                  return acc;
                },
                new Set()
              ).size;

              // Count answered questions per interview for this combination
              metrics.raw_responses
                .filter(
                  (r: any) =>
                    passesOrganizationalFilters(r, metrics) &&
                    getDimensionValue(xAxis, r, metrics, assessment.name) ===
                      xVal &&
                    getDimensionValue(yAxis, r, metrics, assessment.name) ===
                      yVal
                )
                .forEach((r: any) => {
                  const interviewKey = `${assessment.id}-${r.interview_id}`;
                  if (!orgInterviewCompletions[interviewKey]) {
                    orgInterviewCompletions[interviewKey] = {
                      answered: 0,
                      total: totalQuestions,
                    };
                  }
                  orgInterviewCompletions[interviewKey].answered++;
                });
            }
          });

          // Calculate average completion rate across interviews
          const orgCompletionRates = Object.values(orgInterviewCompletions).map(
            (completion) => completion.answered / completion.total
          );
          value =
            orgCompletionRates.length > 0
              ? orgCompletionRates.reduce((sum, rate) => sum + rate, 0) /
                orgCompletionRates.length
              : 0;
          break;
        default:
          value = scores.length;
      }

      crossData.push({
        x: xVal,
        y: yVal,
        value: Math.round(value * 100) / 100,
      });
    });
  });

  const values = crossData.map((d) => d.value);
  const xLabels = [...new Set(crossData.map((d) => d.x))];
  const yLabels = [...new Set(crossData.map((d) => d.y))];

  return {
    data: crossData,
    xLabels,
    yLabels,
    values,
  };
}

export default function AssessmentHeatmap({
  assessmentId: propAssessmentId,
}: AssessmentHeatmapProps) {
  const { assessmentMetrics, isLoading, error, loadAssessmentMetrics } =
    useAnalyticsStore();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    propAssessmentId || "multi-assessment"
  );
  const [assessments, setAssessments] = useState<AssessmentWithCounts[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);
  const [dataType, setDataType] = useState<string>("Average Score");
  const [xAxis, setXAxis] = useState<string>("Site");
  const [yAxis, setYAxis] = useState<string>("Role");
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<string>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New organizational filtering state
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(
    []
  );
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [questionnaireLevel, setQuestionnaireLevel] =
    useState<string>("Section");
  const [viewMode, setViewMode] = useState<string>("Role Performance");

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({
    width: 800,
    height: 500,
  });

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

  // Fetch assessments on mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setAssessmentsLoading(true);
        const data = await assessmentService.getAssessments();
        setAssessments(data);

        // If no assessment is selected and prop provided, use it
        if (!selectedAssessmentId && propAssessmentId && data.length > 0) {
          setSelectedAssessmentId(propAssessmentId);
        }
      } catch (error) {
        console.error("Failed to fetch assessments:", error);
      } finally {
        setAssessmentsLoading(false);
      }
    };

    fetchAssessments();
  }, [propAssessmentId]);

  // Get unique questionnaires from assessments
  const questionnaires = useMemo(() => {
    const unique = [...new Set(assessments.map((a) => a.questionnaire_name))];
    return unique.filter(Boolean); // Remove any null/undefined values
  }, [assessments]);

  // Filter assessments by selected questionnaire
  const filteredAssessments = useMemo(() => {
    if (!selectedQuestionnaire || selectedQuestionnaire === "all")
      return assessments;
    return assessments.filter(
      (a) => a.questionnaire_name === selectedQuestionnaire
    );
  }, [assessments, selectedQuestionnaire]);

  // Extract organizational data from loaded metrics
  const organizationalData = useMemo(() => {
    const businessUnits = new Set<string>();
    const sites = new Set<string>();
    const roles = new Set<string>();

    filteredAssessments.forEach((assessment) => {
      const metrics = assessmentMetrics[assessment.id];
      if (!metrics) return;

      // Extract hierarchy data
      if (metrics.hierarchy) {
        if (metrics.hierarchy.business_unit?.name) {
          businessUnits.add(metrics.hierarchy.business_unit.name);
        }
        if (metrics.hierarchy.site?.name) {
          sites.add(metrics.hierarchy.site.name);
        }
      }

      // Extract role data
      if (metrics.role_breakdown) {
        Object.values(metrics.role_breakdown).forEach((role: any) => {
          if (role.name) {
            roles.add(role.name);
          }
        });
      }
    });

    return {
      businessUnits: Array.from(businessUnits).sort(),
      sites: Array.from(sites).sort(),
      roles: Array.from(roles).sort(),
    };
  }, [filteredAssessments, assessmentMetrics]);

  // Set smart defaults based on view mode
  useEffect(() => {
    if (selectedAssessmentId === "multi-assessment") {
      // Multi-assessment defaults
      if (xAxis === "Site") setXAxis("Assessment");
      if (yAxis === "Role") setYAxis("Role");
    } else {
      // Single assessment defaults based on view mode
      switch (viewMode) {
        case "Role Performance":
          setXAxis(questionnaireLevel);
          setYAxis("Role");
          break;
        case "Site Comparison":
          setXAxis("Site");
          setYAxis(questionnaireLevel);
          break;
        case "Cross-Organizational":
          setXAxis("Role");
          setYAxis("Site");
          break;
      }
    }
  }, [viewMode, selectedAssessmentId, questionnaireLevel]);

  // Load assessment metrics when selection changes
  useEffect(() => {
    if (selectedAssessmentId === "multi-assessment") {
      // Load metrics for all filtered assessments
      filteredAssessments.forEach((assessment) => {
        if (!assessmentMetrics[assessment.id]) {
          loadAssessmentMetrics(assessment.id.toString());
        }
      });
    } else if (
      selectedAssessmentId &&
      !assessmentMetrics[selectedAssessmentId]
    ) {
      loadAssessmentMetrics(selectedAssessmentId);
    }
  }, [
    selectedAssessmentId,
    filteredAssessments,
    assessmentMetrics,
    loadAssessmentMetrics,
  ]);

  // Transform metrics to heatmap matrix data
  const heatmapData = useMemo(() => {
    const organizationalFilters = {
      businessUnits: selectedBusinessUnits,
      sites: selectedSites,
      roles: selectedRoles,
    };

    if (selectedAssessmentId === "multi-assessment") {
      // Multi-assessment analysis with organizational filtering
      return transformOrganizationalData(
        filteredAssessments,
        assessmentMetrics,
        xAxis,
        yAxis,
        dataType,
        organizationalFilters
      );
    } else if (selectedAssessmentId) {
      // Single assessment analysis with organizational filtering
      return transformOrganizationalData(
        [
          filteredAssessments.find(
            (a) => a.id.toString() === selectedAssessmentId
          ),
        ].filter(Boolean),
        assessmentMetrics,
        xAxis,
        yAxis,
        dataType,
        organizationalFilters
      );
    }

    return { data: [], xLabels: [], yLabels: [], values: [] };
  }, [
    assessmentMetrics,
    selectedAssessmentId,
    filteredAssessments,
    xAxis,
    yAxis,
    dataType,
    selectedBusinessUnits,
    selectedSites,
    selectedRoles,
  ]);

  // D3 Heatmap rendering
  useEffect(() => {
    if (!svgRef.current || heatmapData.data.length === 0) return;

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
        .domain(heatmapData.xLabels)
        .range([0, width])
        .padding(0.1);

      const yScale = d3
        .scaleBand()
        .domain(heatmapData.yLabels)
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

      const colorScale = d3
        .scaleSequential()
        .interpolator(brandColorInterpolator)
        .domain(d3.extent(heatmapData.values) as [number, number]);

      // Create heatmap cells
      g.selectAll(".cell")
        .data(heatmapData.data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", (d) => xScale(d.x) || 0)
        .attr("y", (d) => yScale(d.y) || 0)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", (d) => colorScale(d.value))
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

          tooltip
            .html(`${d.x} × ${d.y}<br/>Value: ${d.value.toFixed(1)}`)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", function () {
          d3.selectAll(".heatmap-tooltip").remove();
        });

      // Add text labels to show values in cells
      g.selectAll(".cell-text")
        .data(heatmapData.data)
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
          // Format the value based on data type
          if (dataType === "Completion Rate") {
            return `${(d.value * 100).toFixed(0)}%`;
          } else if (dataType === "Total Interviews") {
            return d.value.toString();
          } else {
            return d.value.toFixed(1);
          }
        });

      // X axis labels (with word wrapping for long labels)
      g.selectAll(".x-label-group")
        .data(heatmapData.xLabels)
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
        .data(heatmapData.yLabels)
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
  }, [heatmapData, xAxis, yAxis, svgDimensions]);

  // Check if we have data to display
  const hasData =
    selectedAssessmentId &&
    (selectedAssessmentId !== "multi-assessment" ||
      filteredAssessments.length > 0) &&
    heatmapData.data.length > 0;

  if (assessmentsLoading) {
    return (
      <Card>
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
      <Card>
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

  // Get selected assessment for display
  const selectedAssessment = filteredAssessments.find(
    (a) => a.id.toString() === selectedAssessmentId
  );

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
                value={selectedQuestionnaire}
                onValueChange={setSelectedQuestionnaire}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="All questionnaires" />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <SelectItem value="all">All questionnaires</SelectItem>
                  {questionnaires.map((questionnaire) => (
                    <SelectItem key={questionnaire} value={questionnaire}>
                      {questionnaire}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Assessment Scope"
                tooltip="Select a single assessment for detailed analysis, or choose 'All Assessments' to compare performance across multiple assessments."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={selectedAssessmentId}
                onValueChange={setSelectedAssessmentId}
                disabled={filteredAssessments.length === 0}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  {filteredAssessments.length === 0 ? (
                    <SelectItem value="no-assessments" disabled>
                      No assessments available
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="multi-assessment">
                        All Assessments (Cross-Analysis)
                      </SelectItem>
                      {filteredAssessments.map((assessment) => (
                        <SelectItem
                          key={assessment.id}
                          value={assessment.id.toString()}
                        >
                          <div
                            className="truncate"
                            title={`${assessment.name} (${assessment.questionnaire_name})`}
                          >
                            {assessment.name}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <LabelWithInfo
                label="Data Metric"
                tooltip="Choose what data to visualize: Average Score (mean ratings), Total Interviews (count), or Completion Rate (percentage of completed responses)."
                isFullscreen={isFullscreen}
                container={cardRef.current}
              />
              <Select
                value={dataType}
                onValueChange={setDataType}
                disabled={!selectedAssessmentId}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  <SelectItem value="Average Score">Average Score</SelectItem>
                  <SelectItem value="Total Interviews">
                    Total Interviews
                  </SelectItem>
                  <SelectItem value="Completion Rate">
                    Completion Rate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Analysis Configuration */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Analysis Configuration</h3>

            {selectedAssessmentId &&
              selectedAssessmentId !== "multi-assessment" && (
                <div className="space-y-2">
                  <LabelWithInfo
                    label="Analysis View"
                    tooltip="Choose the analysis perspective: Role Performance (individual role analysis), Site Comparison (compare different sites), or Cross-Organizational (compare across organizational levels)."
                    isFullscreen={isFullscreen}
                    container={cardRef.current}
                  />
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      container={
                        isFullscreen ? cardRef.current || undefined : undefined
                      }
                    >
                      <SelectItem value="Role Performance">
                        Role Performance
                      </SelectItem>
                      <SelectItem value="Site Comparison">
                        Site Comparison
                      </SelectItem>
                      <SelectItem value="Cross-Organizational">
                        Cross-Organizational
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                disabled={!selectedAssessmentId}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  {selectedAssessmentId === "multi-assessment" && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Comparison
                      </div>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                        Hierarchy
                      </div>
                    </>
                  )}
                  {selectedAssessmentId !== "multi-assessment" && (
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Hierarchy
                    </div>
                  )}
                  <SelectItem value="Business Unit">Business Unit</SelectItem>
                  <SelectItem value="Region">Region</SelectItem>
                  <SelectItem value="Site">Site</SelectItem>
                  <SelectItem value="Asset Group">Asset Group</SelectItem>
                  <SelectItem value="Role">Role</SelectItem>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                    Questionnaire
                  </div>
                  <SelectItem value="Section">Section</SelectItem>
                  <SelectItem value="Step">Step</SelectItem>
                  <SelectItem value="Question">Question</SelectItem>
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
                disabled={!selectedAssessmentId}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  container={
                    isFullscreen ? cardRef.current || undefined : undefined
                  }
                >
                  {selectedAssessmentId === "multi-assessment" && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Comparison
                      </div>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                        Hierarchy
                      </div>
                    </>
                  )}
                  {selectedAssessmentId !== "multi-assessment" && (
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Hierarchy
                    </div>
                  )}
                  <SelectItem value="Business Unit">Business Unit</SelectItem>
                  <SelectItem value="Region">Region</SelectItem>
                  <SelectItem value="Site">Site</SelectItem>
                  <SelectItem value="Asset Group">Asset Group</SelectItem>
                  <SelectItem value="Role">Role</SelectItem>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                    Questionnaire
                  </div>
                  <SelectItem value="Section">Section</SelectItem>
                  <SelectItem value="Step">Step</SelectItem>
                  <SelectItem value="Question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organizational Filters */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm">Organizational Filters</h3>

            {/* Business Units */}
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

            {/* Sites */}
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

            {/* Roles */}
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
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card
      ref={cardRef}
      className={`h-full relative p-0 overflow-hidden ${
        isFullscreen ? "bg-background" : ""
      }`}
    >
      <div className="h-full w-full min-h-[500px] flex">
        {/* Filter Sidebar */}
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
                {selectedQuestionnaire && selectedQuestionnaire !== "all" && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {selectedQuestionnaire}
                  </Badge>
                )}
                {selectedAssessmentId === "multi-assessment" ? (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {filteredAssessments.length} assessments
                  </Badge>
                ) : selectedAssessment ? (
                  <Link
                    to={`/assessments/onsite/${selectedAssessmentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs hover:bg-secondary/80 transition-colors cursor-pointer inline-flex items-center gap-1 flex-shrink-0"
                    >
                      {selectedAssessment.name}
                      <IconExternalLink className="h-2.5 w-2.5" />
                    </Badge>
                  </Link>
                ) : null}

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

                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {dataType}
                </Badge>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {xAxis} × {yAxis}
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
                    {!selectedAssessmentId
                      ? "Please select an assessment from the dropdown to view heatmap data."
                      : selectedAssessmentId === "multi-assessment"
                      ? "No data found for the selected assessments. Please ensure the assessments have been completed with interview responses."
                      : "No data found for the selected assessment. Please ensure the assessment has been completed with interview responses."}
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

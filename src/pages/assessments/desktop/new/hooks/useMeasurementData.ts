import { useState, useEffect } from 'react';
import type { Measurement, DataSource } from '../types/desktop-assessment';

// Transform the JSON data structure to match our types
function transformMeasurementData(jsonData: { measurements?: unknown[], data_sources?: unknown[] }): { measurements: Measurement[], dataSources: DataSource[] } {
  const measurements: Measurement[] = jsonData.measurements?.map((item: Record<string, unknown>) => ({
    id: item.id as number,
    name: item.name as string,
    objective: item.objective as string,
    definition: item.definition as string,
    latex: item.latex as string,
    terms: (item.terms as Array<{ id: number; description: string; term: string }>) || [],
    required_columns: [
      { name: 'work_order_id', type: 'string', description: 'Unique work order identifier', required: true },
      { name: 'completion_date', type: 'date', description: 'Date when work order was completed', required: true },
      { name: 'task_list_attached', type: 'boolean', description: 'Whether a task list was attached', required: true },
      { name: 'work_order_type', type: 'string', description: 'Type of work order (Capital, Preventative, Corrective)', required: true },
      { name: 'status', type: 'string', description: 'Work order status', required: true },
    ],
    data_sources: ['SAP', 'CSV'],
  })) || [];

  const dataSources: DataSource[] = jsonData.data_sources?.map((source: Record<string, unknown>) => ({
    id: source.id as number,
    name: source.name as string,
    description: `Data source for ${source.name}`,
    tables: (source.tables as Array<{ id: number; name: string }>)?.map((table) => ({
      id: table.id,
      name: table.name,
      description: `${table.name} table from ${source.name}`,
      columns: [
        { name: 'id', type: 'number', description: 'Primary key' },
        { name: 'created_date', type: 'date', description: 'Creation date' },
        { name: 'status', type: 'string', description: 'Record status' },
      ],
    })) || [],
  })) || [];

  return { measurements, dataSources };
}

export function useMeasurementData() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeasurementData() {
      try {
        // Load the data.json file from the public directory
        const response = await fetch('/src/pages/assessments/desktop/data.json');
        if (!response.ok) {
          throw new Error('Failed to load measurement data');
        }
        
        const jsonData = await response.json();
        const { measurements: loadedMeasurements, dataSources: loadedDataSources } = transformMeasurementData(jsonData);
        
        setMeasurements(loadedMeasurements);
        setDataSources(loadedDataSources);
        setError(null);
      } catch (err) {
        console.error('Error loading measurement data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        
        // Fallback to mock data for development
        setMeasurements([
          {
            id: 1,
            name: 'Task List Usage Objective',
            objective: 'To view the percentage of completed work orders which had a Task List attached. A large percentage of work orders with Task Lists attached indicates that Work Management can produce quality work orders with predetermined resources, materials and documents.',
            definition: 'Total Work orders completed in previous 12 months that has utilised a task list for work planning over the same period.',
            latex: '\\frac{\\text{All completed Work Orders}}{\\text{All completed Work Orders with Task List Attached}}',
            terms: [
              { id: 1, description: 'Timeframe', term: '12 Months from Current Date' },
              { id: 2, description: 'Work Order Type', term: 'Capital, Preventative, Corrective' },
              { id: 3, description: 'Work Order Status', term: 'Completed' },
            ],
            required_columns: [
              { name: 'work_order_id', type: 'string', description: 'Unique work order identifier', required: true },
              { name: 'completion_date', type: 'date', description: 'Date when work order was completed', required: true },
              { name: 'task_list_attached', type: 'boolean', description: 'Whether a task list was attached', required: true },
              { name: 'work_order_type', type: 'string', description: 'Type of work order', required: true },
              { name: 'status', type: 'string', description: 'Work order status', required: true },
            ],
            data_sources: ['SAP', 'CSV'],
          },
          {
            id: 2,
            name: 'Work Order Completion Rate',
            objective: 'Measure the percentage of work orders completed within the specified timeframe.',
            definition: 'Total completed work orders divided by total work orders created in the measurement period.',
            latex: '\\frac{\\text{Completed Work Orders}}{\\text{Total Work Orders Created}} \\times 100',
            terms: [
              { id: 1, description: 'Measurement Period', term: '6 Months' },
              { id: 2, description: 'Work Order Status', term: 'Completed, In Progress, Cancelled' },
            ],
            required_columns: [
              { name: 'work_order_id', type: 'string', description: 'Unique work order identifier', required: true },
              { name: 'status', type: 'string', description: 'Current status of work order', required: true },
              { name: 'created_date', type: 'date', description: 'Date when work order was created', required: true },
              { name: 'completion_date', type: 'date', description: 'Date when work order was completed', required: false },
            ],
            data_sources: ['SAP', 'MAXIMO', 'CSV'],
          },
        ]);
        
        setDataSources([
          {
            id: 1,
            name: 'SAP',
            description: 'SAP ERP System',
            tables: [
              {
                id: 1,
                name: 'Notifications',
                description: 'Work order notifications',
                columns: [
                  { name: 'notification_id', type: 'string', description: 'Notification identifier' },
                  { name: 'work_order_id', type: 'string', description: 'Associated work order' },
                  { name: 'created_date', type: 'date', description: 'Creation date' },
                ],
              },
              {
                id: 2,
                name: 'Work Orders',
                description: 'Work order master data',
                columns: [
                  { name: 'work_order_id', type: 'string', description: 'Work order identifier' },
                  { name: 'status', type: 'string', description: 'Current status' },
                  { name: 'type', type: 'string', description: 'Work order type' },
                ],
              },
            ],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMeasurementData();
  }, []);

  const getMeasurementById = (id: number): Measurement | undefined => {
    return measurements.find(m => m.id === id);
  };

  const getDataSourceById = (id: number): DataSource | undefined => {
    return dataSources.find(ds => ds.id === id);
  };

  const searchMeasurements = (query: string): Measurement[] => {
    if (!query.trim()) return measurements;
    
    const lowerQuery = query.toLowerCase();
    return measurements.filter(measurement =>
      measurement.name.toLowerCase().includes(lowerQuery) ||
      measurement.objective.toLowerCase().includes(lowerQuery) ||
      measurement.definition.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    measurements,
    dataSources,
    isLoading,
    error,
    getMeasurementById,
    getDataSourceById,
    searchMeasurements,
  };
}
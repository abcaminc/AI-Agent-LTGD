
export interface ChartData {
  chartType: 'line' | 'bar';
  data: Record<string, string | number>[];
  dataKeys: string[];
  xAxisKey: string;
}

export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  chartData?: ChartData;
  sources?: Source[];
  isLoading?: boolean;
}

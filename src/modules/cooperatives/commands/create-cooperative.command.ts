export interface CreateCooperativeCommand {
  name: string;
  ruc: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  sectors?: string[];
}

export interface ValidationError {
  property: string;
  constraints?: { [key: string]: string };
}

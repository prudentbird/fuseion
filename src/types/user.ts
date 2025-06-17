export interface UserInterface {
  id: string;
  email: string;
  preferences: {
    name?: string;
    occupation?: string;
    additionalInfo?: string;
    traits?: string[];
  };
}

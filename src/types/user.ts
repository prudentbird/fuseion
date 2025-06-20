export interface UserInterface {
  userId: string;
  email: string;
  name: string;
  picture: string;
  tier: "free" | "pro";
  preferences: {
    name?: string;
    occupation?: string;
    additionalInfo?: string;
    traits?: string[];
  };
}

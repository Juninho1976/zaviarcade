export type PlayerRole = "admin" | "player";

export type AuthenticatedPlayer = {
  id: string;
  displayName: string;
  role: PlayerRole;
  mustChangePassword: boolean;
};


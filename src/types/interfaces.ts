export interface Roles {
    roleId: string;
    name: string;
    color: string;
    serverId?: string;
}

export interface AgentData {
    discordId: string;
    username: string;
    nomRP: string;
    avatar: string;
    codeMetier: string;
    dateJoin: string;
    matricule: number;
    dernierPDS: number | null;
    inService: number;
    tempsTotalService: number;
    salary: number;
}
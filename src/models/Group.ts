import { Player } from "./Player";

export class Group {
    storageId: string;
    description?: string;
    memberIds: string[];
    loadedMembers?: Player[];
}
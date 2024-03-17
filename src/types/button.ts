import Bot from "../core/client";
import { ButtonInteraction } from "discord.js";

// Définir une interface pour les options de bouton
export interface ButtonOptions {
    customId: string; // Identifiant unique pour le bouton
    execute: (client: Bot, interaction: ButtonInteraction) => Promise<void>; // Fonction à exécuter lorsque le bouton est pressé
}

import type { Player } from '../generated/prisma/client';
import type { PlayerResponse } from './dto/player.response';

/** Duz Prisma Player kaydini frontend'in nested Player sekline cevirir. */
export function toPlayerResponse(player: Player): PlayerResponse {
  return {
    id: player.id,
    name: player.name,
    age: player.age,
    position: player.position,
    team: player.team,
    aiScore: player.aiScore,
    // Prisma null doner; frontend opsiyonel bekledigi icin undefined'a ceviriyoruz.
    matchPercentage: player.matchPercentage ?? undefined,
    aiReasoning: player.aiReasoning ?? undefined,
    imageUrl: player.imageUrl,
    stats: {
      pace: player.pace,
      passing: player.passing,
      defending: player.defending,
      physical: player.physical,
      tackling: player.tackling,
      vision: player.vision,
      dribbling: player.dribbling,
      shooting: player.shooting,
    },
    metrics: {
      sprintSpeed: player.sprintSpeed,
      shotPower: player.shotPower,
      passingAcc: player.passingAcc,
    },
  };
}

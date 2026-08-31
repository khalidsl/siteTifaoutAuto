/**
 * Horaires de TIFAOUT AUTO Agadir :
 * Lundi au Samedi : 08h30 – 19h00
 * Dimanche : Fermé
 */

export interface OpeningStatus {
  isOpen: boolean;
  statusBadgeText: string;
  statusText: string;
  badgeColor: string;
  badgeBg: string;
}

export function getOpeningStatus(dateOverride?: Date): OpeningStatus {
  const now = dateOverride || new Date();
  const day = now.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const openTime = 8 * 60 + 30; // 08:30 (510 min)
  const closeTime = 19 * 60;    // 19:00 (1140 min)

  if (day === 0) {
    return {
      isOpen: false,
      statusBadgeText: 'FERMÉ AUJOURD\'HUI',
      statusText: 'Reouvre Lundi à 08h30',
      badgeColor: '#D97706',
      badgeBg: '#FEF3C7',
    };
  }

  if (timeInMinutes >= openTime && timeInMinutes < closeTime) {
    const remainingMinutes = closeTime - timeInMinutes;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    
    let closingStr = '';
    if (remainingHours > 0) {
      closingStr = `Ferme dans ${remainingHours}h${remainingMins > 0 ? remainingMins + 'm' : ''}`;
    } else {
      closingStr = `Ferme dans ${remainingMins} min`;
    }

    return {
      isOpen: true,
      statusBadgeText: 'OUVERT ACTUELLEMENT',
      statusText: `Ouvert jusqu'à 19h00 · ${closingStr}`,
      badgeColor: '#16A34A',
      badgeBg: '#DCFCE7',
    };
  } else if (timeInMinutes < openTime) {
    return {
      isOpen: false,
      statusBadgeText: 'FERMÉ (Ouvre bientôt)',
      statusText: 'Ouvre ce matin à 08h30',
      badgeColor: '#D97706',
      badgeBg: '#FEF3C7',
    };
  } else {
    return {
      isOpen: false,
      statusBadgeText: 'FERMÉ CE SOIR',
      statusText: day === 6 ? 'Reouvre Lundi à 08h30' : 'Reouvre demain à 08h30',
      badgeColor: '#D97706',
      badgeBg: '#FEF3C7',
    };
  }
}

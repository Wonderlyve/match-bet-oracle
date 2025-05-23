
import { BettingTicketData } from '@/components/BettingTicket';

const STORAGE_KEY = 'betting_tickets';

export const saveTicket = (ticket: BettingTicketData): void => {
  try {
    const existingTickets = getTickets();
    const updatedTickets = [ticket, ...existingTickets];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
    console.log('Ticket sauvegardé:', ticket.id);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

export const getTickets = (): BettingTicketData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return [];
  }
};

export const updateTickets = (tickets: BettingTicketData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    console.log('Tickets mis à jour');
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  }
};

export const clearTickets = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Historique effacé');
  } catch (error) {
    console.error('Erreur lors de l\'effacement:', error);
  }
};

export const deleteTicket = (ticketId: string): void => {
  try {
    const existingTickets = getTickets();
    const updatedTickets = existingTickets.filter(ticket => ticket.id !== ticketId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
    console.log('Ticket supprimé:', ticketId);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
};

export const toggleFavorite = (ticketId: string): void => {
  try {
    const existingTickets = getTickets();
    const updatedTickets = existingTickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, favorite: !ticket.favorite };
      }
      return ticket;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
    console.log('Statut favori modifié:', ticketId);
  } catch (error) {
    console.error('Erreur lors de la modification du statut favori:', error);
  }
};

export const getFavoriteTickets = (): BettingTicketData[] => {
  try {
    const allTickets = getTickets();
    return allTickets.filter(ticket => ticket.favorite);
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return [];
  }
};

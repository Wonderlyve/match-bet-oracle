
import { BettingTicketData } from '@/components/BettingTicket';

const STORAGE_KEY = 'betting_tickets';

export const saveTicket = (ticket: BettingTicketData): void => {
  try {
    const existingTickets = getTickets();
    const updatedTickets = [ticket, ...existingTickets];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
    console.log('✅ Ticket sauvegardé:', ticket.id);
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
  }
};

export const getTickets = (): BettingTicketData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const tickets = JSON.parse(stored) as BettingTicketData[];
    return tickets.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('❌ Erreur lecture:', error);
    return [];
  }
};

export const clearTickets = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Historique effacé');
  } catch (error) {
    console.error('❌ Erreur suppression:', error);
  }
};

export const deleteTicket = (ticketId: string): void => {
  try {
    const tickets = getTickets();
    const updatedTickets = tickets.filter(ticket => ticket.id !== ticketId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
    console.log('🗑️ Ticket supprimé:', ticketId);
  } catch (error) {
    console.error('❌ Erreur suppression ticket:', error);
  }
};

export const toggleFavorite = (ticketId: string): void => {
  try {
    const tickets = getTickets();
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, isFavorite: !ticket.isFavorite };
      }
      return ticket;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
    console.log('⭐ Favori basculé:', ticketId);
  } catch (error) {
    console.error('❌ Erreur toggle favori:', error);
  }
};

export const getFavoriteTickets = (): BettingTicketData[] => {
  try {
    const allTickets = getTickets();
    return allTickets.filter(ticket => ticket.isFavorite === true);
  } catch (error) {
    console.error('❌ Erreur récupération favoris:', error);
    return [];
  }
};

export const getTicketById = (ticketId: string): BettingTicketData | null => {
  try {
    const tickets = getTickets();
    return tickets.find(ticket => ticket.id === ticketId) || null;
  } catch (error) {
    console.error('❌ Erreur récupération ticket:', error);
    return null;
  }
};

'use client';

import { authApi } from '../api/auth-api';
import { isSessionExpired, readAccessToken, reportSessionExpired } from '../storage';
import { ObservableStore } from './observable-store';

export type OfferCategory = 'University' | 'Bank' | 'Scholarship' | 'Consultancy';
export type OfferDecisionStatus = 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
export type JourneyStage = 'Received' | 'Viewed' | 'Compared' | 'Shortlisted' | 'Accepted' | 'Declined';

export interface OfferMessage {
  /** 'system' is the platform speaking for neither side — a notice, not a reply. */
  from: 'institution' | 'student' | 'system';
  author: string;
  body: string;
  time: string;
  /** Written by an automation rule rather than typed by a person. */
  automatic?: boolean;
}

export interface StudentOffer {
  id: string;
  category: OfferCategory;
  institution: string;
  initial: string;
  logo?: string;
  institutionWebsite: string;
  institutionDescription: string;
  program: string;
  headline: string;
  description: string;
  received: string;
  /** The unformatted timestamps, for screens that need the date parts. */
  receivedAt: string;
  deadlineAt: string;
  status: OfferDecisionStatus;
  location: string;
  intake: string;
  deadline: string;
  valueLabel: string;
  value: string;
  conditions: string;
  nextSteps: string[];
  contact: string;
  contactRole: string;
  messages: OfferMessage[];
  recommended?: boolean;
  viewed: boolean;
  compared: boolean;
  saved: boolean;
  favourite: boolean;

  // University comparison fields
  tuitionFee?: string;
  scholarshipPct?: number;
  durationYears?: number;
  qsRanking?: string;
  placementHighlights?: string;

  // Bank comparison fields
  loanAmount?: string;
  interestRate?: string;
  emi?: string;
  moratorium?: string;
  processingFee?: string;
  tenure?: string;

  // Scholarship comparison fields
  amount?: string;
  coverage?: string;
  eligibility?: string;

  // Consultancy comparison fields
  visaServices?: string;
  accommodationSupport?: string;
  supportServices?: string;
}

export interface OfferCounts {
  total: number;
  new: number;
  university: number;
  bank: number;
  scholarship: number;
  consultancy: number;
  saved: number;
  accepted: number;
}

const EMPTY_COUNTS: OfferCounts = {
  total: 0, new: 0, university: 0, bank: 0, scholarship: 0, consultancy: 0, saved: 0, accepted: 0
};

const shortDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

const longDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const messageTime = (iso: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

/** The API already returns the wallet shape; only the timestamps need formatting. */
function fromApi(offer: Record<string, any>): StudentOffer {
  return {
    ...(offer as StudentOffer),
    receivedAt: offer.received,
    deadlineAt: offer.deadline,
    received: shortDate(offer.received),
    deadline: longDate(offer.deadline),
    messages: (offer.messages || []).map((message: Record<string, any>) => ({
      ...message,
      time: messageTime(message.time)
    }))
  };
}

/**
 * The student's offers, exactly as the server holds them. Nothing is seeded and
 * nothing is cached in the browser — an empty wallet means no organization has
 * sent anything yet.
 */
class OfferWalletStore extends ObservableStore {
  offers: StudentOffer[] = [];
  counts: OfferCounts = EMPTY_COUNTS;
  compareSelectionIds: string[] = [];

  loading = false;
  loaded = false;
  error = '';

  async load(force = false): Promise<void> {
    if (this.loading || (this.loaded && !force)) return;
    const token = readAccessToken();
    if (!token) return;

    this.loading = true;
    this.emit();
    try {
      const response = await authApi.studentOffers(token);
      this.offers = ((response?.results || []) as Record<string, any>[]).map(fromApi);
      this.counts = response?.counts || EMPTY_COUNTS;
      this.compareSelectionIds = this.offers.filter(offer => offer.compared).map(offer => offer.id);
      this.loaded = true;
      this.error = '';
    } catch (e) {
      if (isSessionExpired(e)) {
        this.reset();
        reportSessionExpired();
        return;
      }
      this.error = e instanceof Error ? e.message : 'Could not load your offers.';
    } finally {
      this.loading = false;
      this.emit();
    }
  }

  reset(): void {
    this.offers = [];
    this.counts = EMPTY_COUNTS;
    this.compareSelectionIds = [];
    this.loaded = false;
    this.error = '';
    this.emit();
  }

  private find(id: string): StudentOffer | undefined {
    return this.offers.find(offer => offer.id === id);
  }

  /** Applies the server's copy of one offer, then recounts. */
  private apply(updated: Record<string, any> | undefined): void {
    if (!updated?.id) return;
    const index = this.offers.findIndex(offer => offer.id === updated.id);
    if (index >= 0) this.offers[index] = fromApi(updated);
    this.compareSelectionIds = this.offers.filter(offer => offer.compared).map(offer => offer.id);
    this.recount();
    this.emit();
  }

  private recount(): void {
    const byCategory = (category: OfferCategory) => this.offers.filter(offer => offer.category === category).length;
    this.counts = {
      total: this.offers.length,
      new: this.offers.filter(offer => !offer.viewed).length,
      university: byCategory('University'),
      bank: byCategory('Bank'),
      scholarship: byCategory('Scholarship'),
      consultancy: byCategory('Consultancy'),
      saved: this.offers.filter(offer => offer.saved).length,
      accepted: this.offers.filter(offer => offer.status === 'Accepted').length
    };
  }

  private async mutate(call: (token: string) => Promise<any>): Promise<void> {
    const token = readAccessToken();
    if (!token) return;
    try {
      this.apply(await call(token));
    } catch (e) {
      if (isSessionExpired(e)) {
        reportSessionExpired();
        return;
      }
      this.error = e instanceof Error ? e.message : 'That change could not be saved.';
      this.emit();
    }
  }

  markViewed(id: string): void {
    const offer = this.find(id);
    if (!offer || offer.viewed) return;
    void this.mutate(token => authApi.viewOffer(token, id));
  }

  toggleFavourite(id: string): void {
    const offer = this.find(id);
    if (!offer) return;
    void this.mutate(token => authApi.setOfferFlags(token, id, { favourite: !offer.favourite }));
  }

  toggleSaved(id: string): void {
    const offer = this.find(id);
    if (!offer) return;
    void this.mutate(token => authApi.setOfferFlags(token, id, { saved: !offer.saved }));
  }

  toggleCompareSelect(id: string): void {
    const offer = this.find(id);
    if (!offer) return;
    void this.mutate(token => authApi.setOfferFlags(token, id, { compared: !offer.compared }));
  }

  setStatus(id: string, status: OfferDecisionStatus): void {
    void this.mutate(token => authApi.decideOffer(token, id, status));
  }

  addMessage(id: string, body: string): void {
    void this.mutate(token => authApi.messageOffer(token, id, body));
  }

  stage(offer: StudentOffer): JourneyStage {
    if (offer.status === 'Accepted') return 'Accepted';
    if (offer.status === 'Rejected') return 'Declined';
    if (offer.status === 'Shortlisted') return 'Shortlisted';
    if (offer.compared) return 'Compared';
    if (offer.viewed) return 'Viewed';
    return 'Received';
  }

  get totalCount(): number { return this.counts.total; }
  get newCount(): number { return this.counts.new; }
  get universityCount(): number { return this.counts.university; }
  get bankCount(): number { return this.counts.bank; }
  get scholarshipCount(): number { return this.counts.scholarship; }
  get consultancyCount(): number { return this.counts.consultancy; }
  get savedCount(): number { return this.counts.saved; }
  get acceptedCount(): number { return this.counts.accepted; }
}

export const offerWalletStore = new OfferWalletStore();
export type { OfferWalletStore };

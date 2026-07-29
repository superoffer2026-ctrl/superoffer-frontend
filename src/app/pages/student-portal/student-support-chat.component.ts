import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SupportMessage {
  from: 'support' | 'student';
  text: string;
  time: string;
}

@Component({
  selector: 'app-student-support-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './student-workspace-pages.css',
  template: `
    <button class="floating-chat-button" type="button" (click)="open=!open" [attr.aria-expanded]="open" aria-label="Chat with SuperOffer Support">
      <span>{{open ? '×' : '◌'}}</span><strong *ngIf="!open">Chat with us</strong>
    </button>
    <section class="floating-chat-panel" *ngIf="open">
        <header class="support-chat-head">
          <span class="support-agent">S</span>
          <div><h2>SuperOffer Support</h2><p><i></i> Online · Typically replies in a few minutes</p></div>
          <button type="button" (click)="open=false" aria-label="Close chat">×</button>
        </header>
        <div class="support-chat-notice">Your conversation is private and visible only to the SuperOffer support team.</div>
        <div class="support-chat-thread">
          <div *ngFor="let message of messages" [class.student-chat-message]="message.from==='student'">
            <small>{{message.from==='student' ? 'You' : 'SuperOffer Support'}}</small>
            <p>{{message.text}}</p>
            <time>{{message.time}}</time>
          </div>
        </div>
        <form class="support-chat-composer" (ngSubmit)="send()">
          <button type="button" aria-label="Attach a file">＋</button>
          <input name="supportMessage" [(ngModel)]="draft" placeholder="Message SuperOffer Support…" autocomplete="off">
          <button class="send-chat" type="submit" [disabled]="!draft.trim()" aria-label="Send message">➤</button>
        </form>
    </section>
  `
})
export class StudentSupportChatComponent {
  open = false;
  draft = '';
  messages: SupportMessage[] = [
    {from:'support',text:'Hi! Welcome to SuperOffer Support. How can we help with your study-abroad journey today?',time:'Just now'}
  ];
  send() {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.push({from:'student', text, time:'Just now'});
    this.draft = '';
  }
}

import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { IntegrationsService } from '../../core/integrations/integrations.service';

@Component({
  selector: 'app-coming-soon',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.css',
})
export class ComingSoonComponent implements OnInit, OnDestroy {
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  emailCtrl = new FormControl('', [Validators.required, Validators.email]);
  savingInProgress = signal(false);
  emailSent = signal(false);

  private countdownInterval?: NodeJS.Timeout;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private integrationsService: IntegrationsService,
  ) {}

  ngOnInit(): void {
    this.updateCountdown();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  onNotifyMeSubmitted(): void {
    if (this.savingInProgress()) {
      return;
    }
    if (this.emailCtrl.invalid) {
      this.emailCtrl.markAllAsTouched();
      return;
    }

    this.savingInProgress.set(true);
    this.integrationsService
      .subscribeForComingSoon(this.emailCtrl.value!)
      .pipe(
        finalize(() => {
          this.savingInProgress.set(false);
        }),
      )
      .subscribe(() => {
        this.emailSent.set(true);
      });
  }

  private startCountdown(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.countdownInterval = setInterval(() => {
        this.updateCountdown();
      }, 1000);
    }
  }

  private updateCountdown(): void {
    const targetDate = new Date('2025-03-31T23:59:59');
    const now = new Date();
    const timeDiff = targetDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      clearInterval(this.countdownInterval);
      return;
    }

    this.days = Math.floor(timeDiff / 86400000);
    this.hours = Math.floor((timeDiff % 86400000) / 3600000);
    this.minutes = Math.floor((timeDiff % 3600000) / 60000);
    this.seconds = Math.floor((timeDiff % 60000) / 1000);
  }
}

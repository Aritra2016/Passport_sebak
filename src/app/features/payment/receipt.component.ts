import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PassportStateService } from '../../store/passport-state.service';
import { PassportApplication } from '../../core/models/passport.model';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})
export class ReceiptComponent implements OnInit {
  application?: PassportApplication;
  currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  constructor(
    private stateService: PassportStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const queryArn = this.route.snapshot.queryParams['arn'];
    const apps = this.stateService.applications();

    if (queryArn) {
      this.application = this.stateService.getApplicationByArn(queryArn);
    } else if (apps.length > 0) {
      this.application = apps[0];
    }
  }

  printReceipt(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  trackStatus(): void {
    this.router.navigate(['/tracking'], { queryParams: { arn: this.application?.arn } });
  }
}


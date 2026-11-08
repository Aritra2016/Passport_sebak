import { Component, OnInit } from '@angular/core';
import { ActivityTelemetryService } from './core/services/activity-telemetry.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'passport_app';

  constructor(private telemetry: ActivityTelemetryService) {}

  ngOnInit(): void {
    this.telemetry.start();
  }
}

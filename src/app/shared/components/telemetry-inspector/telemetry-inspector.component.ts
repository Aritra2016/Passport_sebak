import { Component } from '@angular/core';
import { ActivityTelemetryService } from '../../../core/services/activity-telemetry.service';
import { TelemetryEvent } from '../../../core/models/telemetry.model';

@Component({
  selector: 'app-telemetry-inspector',
  templateUrl: './telemetry-inspector.component.html',
  styleUrls: ['./telemetry-inspector.component.css']
})
export class TelemetryInspectorComponent {
  isExpanded = false;
  selectedCategory: 'ALL' | 'VALUE' | 'MOUSE' | 'KEYBOARD' | 'CONSOLE' = 'ALL';
  selectedEvent: TelemetryEvent | null = null;

  constructor(public telemetryService: ActivityTelemetryService) {}

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  setCategory(category: 'ALL' | 'VALUE' | 'MOUSE' | 'KEYBOARD' | 'CONSOLE'): void {
    this.selectedCategory = category;
  }

  get filteredEvents(): TelemetryEvent[] {
    const all = this.telemetryService.events();
    if (this.selectedCategory === 'ALL') {
      return all;
    }
    return all.filter(e => e.category === this.selectedCategory);
  }

  selectEvent(event: TelemetryEvent): void {
    this.selectedEvent = this.selectedEvent?.id === event.id ? null : event;
  }

  /**
   * Triggers a live multi-stream simulation demonstrating capture in Console & Network tab:
   * 1. Mouse click
   * 2. Keyboard typing
   * 3. Form value change
   * 4. Console log
   */
  triggerTestSimulation(): void {
    this.telemetryService.dispatchNetworkEvent('CONSOLE', 'SIMULATED_CONSOLE_LOG', {
      message: 'Passport application form step initialized.',
      component: 'ApplicationContainerComponent',
      step: 2
    });

    this.telemetryService.dispatchNetworkEvent('MOUSE', 'SIMULATED_MOUSE_CLICK', {
      button: 'Left-Click',
      target: 'button#btn-save-draft',
      x: 480,
      y: 310
    });

    this.telemetryService.dispatchNetworkEvent('KEYBOARD', 'SIMULATED_KEY_PRESS', {
      key: 'Enter',
      code: 'Enter',
      target: 'input#givenName',
      action: 'FormStepNext'
    });

    this.telemetryService.dispatchNetworkEvent('VALUE', 'SIMULATED_VALUE_CHANGE', {
      fieldName: 'givenName',
      oldValue: 'VIKRAM',
      newValue: 'VIKRAMADITYA',
      form: 'PersonalDetailsForm'
    });
  }
}


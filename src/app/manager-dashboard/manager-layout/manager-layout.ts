import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ManagerSidebar } from '../manager-sidebar/manager-sidebar';
import { HeaderComponent } from '../../layout/header/header.component';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [RouterOutlet, ManagerSidebar, HeaderComponent],
  templateUrl: './manager-layout.html',
  styleUrls: ['./manager-layout.css'],
})
export class ManagerLayout {
  sidebarCollapsed = false;

  onSidebarToggle() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

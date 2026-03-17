import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../../layout/header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class Admin_LayoutComponent {
  sidebarCollapsed = false;

  onSidebarToggle() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

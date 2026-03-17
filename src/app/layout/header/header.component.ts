import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  user = {
    name: 'Admin User',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff'
  };
}

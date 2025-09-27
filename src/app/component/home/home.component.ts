import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { HomepageHeaderComponent } from '../homepage-header/homepage-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  
  imports: [
    CommonModule,
    RouterModule,
    HomepageHeaderComponent
  ]
})
export class HomeComponent {
  
}

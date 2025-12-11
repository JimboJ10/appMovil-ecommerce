import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class RatingStarsComponent {
  @Input() rating: number = 0;
  @Input() readonly: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];

  onStarClick(star: number) {
    if (!this.readonly) {
      this.rating = star;
      this.ratingChange.emit(this.rating);
    }
  }

  getStarIcon(star: number): string {
    if (star <= this.rating) {
      return 'star';
    } else if (star - 0.5 === this.rating) {
      return 'star-half';
    } else {
      return 'star-outline';
    }
  }
}
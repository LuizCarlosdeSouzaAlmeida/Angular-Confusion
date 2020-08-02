import { Injectable } from '@angular/core';

import { Dish } from '../shared/dish';
import { DISHES } from '../shared/dishes';

@Injectable({
  providedIn: 'root'
})
export class DishService {

  getDish(id: string): Dish {
    return DISHES.filter((dish) => (dish.id === id))[0];
  }
  getFeaturedDish(): Dish {
    return DISHES.filter((dish) => dish.featured)[0];
  }
  getDishes(): Dish[] {
    return DISHES;
  }
  constructor() { }
}

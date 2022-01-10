import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {
  @ViewChild('fform') commentFormDirective;

  formErrors = {
    author: '',
    comment: '',
  };

  validationMessages = {
    author: {
      required: 'Name is required.',
      minlength: 'Name must be at least 2 characters long.',
      maxlength: 'Name cannot be more than 35 characters long.',
    },
    comment: {
      required: 'Comment is required.',
      minlength: 'Comment must be at least 2 characters long.',
      maxlength: 'Comment cannot be more than 512 characters long.',
    },
  };

  dish: Dish;
  dishcopy: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  errMess: string;
  visibility = 'shown';

  constructor(
    private dishService: DishService,
    @Inject('BaseURL') public BaseURL,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.dishService
      .getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds,
        errmess => this.errMess = <any>errmess);
        this.route.params
          .pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(+params['id']); }))
          .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.errMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev =
      this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next =
      this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm(): void {
    this.commentForm = this.fb.group({
      author: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(35),
        ],
      ],
      rating: 5,
      comment: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(512),
        ],
      ],
      date: '',
    });
    this.commentForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    this.dish.comments.push(this.comment);
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.commentForm.reset({
      rating: 5,
      comment: '',
    });
    this.commentFormDirective.resetForm();
  }
}

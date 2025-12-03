import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { District } from 'src/app/common/district';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { Upazila } from 'src/app/common/upazila';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { OnlineShopFormService } from 'src/app/services/online-shop-form.service';
import { OnlineShopValidators } from 'src/app/validators/online-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  districts: District[] = [];

  shippingAddressUpazilas: Upazila[] = [];
  billingAddressUpazilas: Upazila[] = [];

  storage: Storage = sessionStorage;

  constructor(private formBuilder: FormBuilder,
              private onlineShopFormService: OnlineShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    let theEmail = '';
    // read the user's email address from browser storage
    if(this.storage.getItem('userEmail')==undefined){
      theEmail = JSON.parse(this.storage.getItem('userEmail')!);
    }

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
                                  [Validators.required, 
                                   Validators.minLength(2), 
                                   OnlineShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('',
                                 [Validators.required, 
                                  Validators.minLength(2),
                                  OnlineShopValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail,
                              [Validators.required, 
                               Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        address: new FormControl('',
                                 [Validators.required, 
                                  Validators.minLength(2),
                                  OnlineShopValidators.notOnlyWhitespace]),
        upazila: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required])
      }),
      billingAddress: this.formBuilder.group({
        address: new FormControl('',
                                 [Validators.required, 
                                  Validators.minLength(2),
                                  OnlineShopValidators.notOnlyWhitespace]),
        upazila: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required])
      })
    });

    // populate districts
    this.onlineShopFormService.getDistricts().subscribe(
      data => {
        console.log("Retrieved districts: " + JSON.stringify(data));
        this.districts = data;
      }
    );

  }
  reviewCartDetails() {
    
    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressName() { return this.checkoutFormGroup.get('shippingAddress.address'); }
  get shippingAddressUpazila() { return this.checkoutFormGroup.get('shippingAddress.upazila'); }
  get shippingAddressDistrict() { return this.checkoutFormGroup.get('shippingAddress.district'); }

  get billingAddressName() { return this.checkoutFormGroup.get('billingAddress.address'); }
  get billingAddressUpazila() { return this.checkoutFormGroup.get('billingAddress.upazila'); }
  get billingAddressDistrict() { return this.checkoutFormGroup.get('billingAddress.district'); }
 
  copyShippingAddressToBillingAddress(event: Event) {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.checkoutFormGroup.get('billingAddress')
        ?.setValue(this.checkoutFormGroup.get('shippingAddress')?.value);

      // bug fix for upazilas
      this.billingAddressUpazilas = this.shippingAddressUpazilas;

    } 
    else {
      this.checkoutFormGroup.get('billingAddress')?.reset();

      // bug fix for upazilas
      this.billingAddressUpazilas = [];
    }
  }


  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thing
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));
    
    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchse - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingUpazila: Upazila = JSON.parse(JSON.stringify(purchase.shippingAddress.upazila));
    const shippingDistrict: District = JSON.parse(JSON.stringify(purchase.shippingAddress.district));
    purchase.shippingAddress.upazila = shippingUpazila.name;
    purchase.shippingAddress.district = shippingDistrict.name;

    // populate purchse - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingUpazila: Upazila = JSON.parse(JSON.stringify(purchase.billingAddress.upazila));
    const billingDistrict: District = JSON.parse(JSON.stringify(purchase.billingAddress.district));
    purchase.billingAddress.upazila = billingUpazila.name;
    purchase.billingAddress.district = billingDistrict.name;

    // populate purchse - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          // reset cart
          this.resetCart();

        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    );

    
  }


  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  getUpazilas(formGroupName: string) {
    
    const formGroup = this.checkoutFormGroup.get(formGroupName)!;

    const districtCode = formGroup?.value.district.code;
    const districtName = formGroup?.value.district.name;

    console.log(`${formGroupName} district code: ${districtCode}`);
    console.log(`${formGroupName} district name: ${districtName}`);

    this.onlineShopFormService.getUpazilas(districtCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressUpazilas = data;
        }
        else {
          this.billingAddressUpazilas = data;
        }

        // select first item by default
        formGroup.get('upazila')!.setValue(data[0]);
      }
    );

  }

}

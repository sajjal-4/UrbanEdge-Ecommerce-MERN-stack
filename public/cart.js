// cart.js (updated)

const cartIcon = document.getElementById('cart-icon');
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotal = document.getElementById('cart-subtotal');
const totalPrice = document.getElementById('total-price');
const discountPrice = document.getElementById('discount-price');
const checkoutButton = document.getElementById('checkout-button');
const applyButton = document.getElementById('coupon-button');

// Fetch and update the cart view
async function updateCart() {
  try {
    const response = await fetch('/api/cart');
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    const cartItems = await response.json();

    cartItemsContainer.innerHTML = ''; // Clear previous items
    let subtotal = 0;

    cartItems.forEach((item) => {
      const row = document.createElement('tr');

      row.innerHTML = `
                <td><a href="#" class="fas fa-times-circle" onclick="removeItem('${item._id}', event)"></a></td>
                <td><img src="${item.productId.image}" alt="${item.productId.name}"></td>
                <td>${item.productId.name}</td>
                <td>$${item.productId.price.toFixed(2)}</td>
                <td><input type="number" value="${item.quantity}" onchange="updateQuantity('${item._id}', this.value)" min="1"></td>
                <td>$${(item.productId.price * item.quantity).toFixed(2)}</td>
            `;

      cartItemsContainer.appendChild(row);
      subtotal += item.productId.price * item.quantity;
    });

    // Update subtotal and total
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    updateTotal(subtotal);

    // Update the cart icon with the number of items
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    cartIcon.innerHTML = `(${totalItems})`;
  } catch (error) {
    console.error('Error:', error);
    cartItemsContainer.innerHTML = '<tr><td colspan="6">Error loading cart.</td></tr>';
  }
}

// Remove an item from the cart
async function removeItem(itemId, event) {
    event.preventDefault();
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from cart');
      }
  
      updateCart(); // Update the cart display after successful deletion
    } catch (error) {
      console.error('Error removing item from cart:', error);
      alert(error.message);
    }
  }

// Update item quantity
async function updateQuantity(itemId, quantity) {
    if (quantity < 1) {
      alert('Quantity must be at least 1.');
      return;
    }
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: parseInt(quantity) }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update item quantity');
      }
  
      updateCart(); // Update the cart display after successful update
    } catch (error) {
      console.error('Error updating item quantity:', error);
      alert(error.message);
    }
  }
  

// Update total price, including discount
function updateTotal(subtotal) {
  const discount = parseFloat(discountPrice.textContent.replace('$', '')) || 0;
  const total = subtotal - discount;
  totalPrice.textContent = `$${total.toFixed(2)}`;
}

// Handle checkout click
checkoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const cartItems = await response.json();
  
      if (cartItems.length === 0) {
        alert('Your cart is empty.');
        return;
      }
  
      // Perform the checkout process here (e.g., payment gateway integration)
  
      // Clear the cart after successful purchase
      const clearCartResponse = await fetch('/api/cart', {
        method: 'DELETE',
      });
  
      if (!clearCartResponse.ok) {
        throw new Error('Failed to clear cart after purchase');
      }
  
      alert('Purchase Successful!');
      updateCart(); // Update cart display after purchase
    } catch (error) {
      console.error('Error during checkout:', error);
      alert(error.message);
    }
  });

// Handle coupon application click
applyButton.addEventListener('click', () => {
  const couponInput = document.getElementById('coupon-input');
  const couponCode = couponInput.value.trim().toLowerCase();

  if (couponCode === '') {
    alert('Please enter a coupon code.');
    return;
  }

  // Example: Apply a 10% discount for a specific coupon code
  if (couponCode === 'discount10') {
    const discount = 0.1;
    const subtotal = parseFloat(cartSubtotal.textContent.replace('$', ''));
    const discountAmount = subtotal * discount;
    discountPrice.textContent = `$${discountAmount.toFixed(2)}`;
    updateTotal(subtotal);
    alert('Coupon Applied! 10% discount added.');
  } else {
    alert('Invalid coupon code.');
  }
});

// Initial cart update
updateCart();
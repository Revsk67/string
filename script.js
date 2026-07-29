let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentCategory = "";
let products = {};
let instruments = {};
let brands = {};

fetch("data/products.csv")
.then(response => response.text())
.then(data => {

    let rows = Papa.parse(data, {
        header: true
    }).data;


    rows.forEach(item => {

        if(!products[item.model]){
            products[item.model] = [];
        }


        products[item.model].push({

            name:item.name,
            price:item.price,
            image:item.image,
            instrument:item.instrument,
            description:item.description

        });
        // Создаём список фирм и моделей автоматически
// Создаём раздел для инструмента
if (!brands[item.instrument_id]) {
    brands[item.instrument_id] = {};
}

// Создаём раздел для фирмы
if (!brands[item.instrument_id][item.brand]) {
    brands[item.instrument_id][item.brand] = [];
}

// Добавляем модель
if (!brands[item.instrument_id][item.brand].includes(item.model)) {
    brands[item.instrument_id][item.brand].push(item.model);
}

// Создаём список инструментов автоматически

if (!instruments[item.instrument_id]) {

    instruments[item.instrument_id] = {

        name: item.instrument,
        brands: []

    };

}

if (!instruments[item.instrument_id].brands.includes(item.brand)) {

    instruments[item.instrument_id].brands.push(item.brand);

}

    });

    // console.log(brands);
    console.log(instruments);
    // console.log(products);

});





function openCategory(category){


currentCategory = category;


let catalog = document.getElementById("catalog");


let data = instruments;



catalog.innerHTML = `

<div class="catalog-window">


<h2>${data[category].name}</h2>


<div class="brands">


${data[category].brands.map((brand,index)=>


`

<div class="brand" 
data-brand="${brand}"
onclick="openBrand(this.dataset.brand)"
style="animation-delay:${index*0.1}s">


${brand}

<span>→</span>


</div>


`


).join("")}


</div>


<div id="models"></div>


</div>


`;


catalog.scrollIntoView({
behavior:"smooth"
});


}

function openBrand(brand){

let models = document.getElementById("models");

let data = brands[currentCategory];



models.innerHTML = `

<div class="models-window">


<h3>${brand}</h3>


<div class="model-list">


${data[brand].map(model=>


`

<div class="model"
onclick="openModel('${model}')">

${model}

<span>→</span>

</div>


`

).join("")}


</div>


</div>

`;


models.scrollIntoView({
behavior:"smooth"
});


}

function openModel(model){


let models = document.getElementById("models");





models.innerHTML = `

<div class="products-window">


<h3>${model}</h3>


<div class="products">


${products[model].map(product=>


`

<div class="product">


<img 
class="product-photo"
src="${product.image}"
alt="${product.name}"
>


<h4>
${product.name}
</h4>


<p class="instrument">
Для: ${product.instrument}
</p>


<p class="description">
${product.description}
</p>


<div class="product-price">
${product.price}
</div>


<button onclick="openOrder('${product.name}')">

Заказать

</button>

</div>


`

).join("")}


</div>


</div>

`;


models.scrollIntoView({
behavior:"smooth"
});


}

function addToCart(name, price){


cart.push({

name:name,
price:price

});


localStorage.setItem("cart", JSON.stringify(cart));


document.getElementById("cart-count").innerHTML = cart.length;


alert(name + " добавлен в корзину");


}



function openCart(){


let panel = document.getElementById("cart-panel");


let total = cart.reduce((sum,item)=>{

return sum + Number(item.price.replace(/\D/g,""));

},0);



panel.innerHTML = `

<div class="cart-overlay" onclick="closeCart()"></div>


<div class="cart-box">


<div class="cart-header">

<h2>Корзина</h2>

<span onclick="closeCart()">×</span>

</div>



<div class="cart-products">


${
cart.length === 0

?

"<p>Корзина пуста</p>"

:

cart.map((item,index)=>


`

<div class="cart-product">


<div>

${item.name}

<br>

<span>${item.price}</span>

</div>


<button onclick="removeFromCart(${index})">

Удалить

</button>


</div>


`

).join("")

}


</div>



<div class="cart-total">

Итого:
<strong>${total} ₽</strong>

</div>


<button class="checkout" onclick="openCheckout()">

Оформить заказ

</button>


</div>


`;


panel.classList.add("active");


}

function closeCart(){

    let panel = document.getElementById("cart-panel");

    panel.classList.remove("active");

    panel.innerHTML = "";

}

function removeFromCart(index){

    cart.splice(index, 1);


    localStorage.setItem("cart", JSON.stringify(cart));


    document.getElementById("cart-count").innerHTML = cart.length;


    openCart();

}

window.onload = function(){

document.getElementById("cart-count").innerHTML = cart.length;

}

function openCheckout(){

let panel = document.getElementById("cart-panel");


panel.innerHTML = `


<div class="cart-overlay" onclick="closeCart()"></div>


<div class="cart-box">


<div class="cart-header">

<h2>Оформление заказа</h2>

<span onclick="closeCart()">×</span>

</div>



<form class="checkout-form" onsubmit="submitOrder(event)">


<input 
type="text"
placeholder="Ваше имя"
required>



<input 
type="tel"
placeholder="Телефон"
required>



<input 
type="email"
placeholder="Email">



<select>

<option>
Доставка
</option>

<option>
Самовывоз
</option>

</select>



<textarea placeholder="Комментарий"></textarea>



<button class="checkout">

Отправить заказ

</button>


</form>


</div>


`;

panel.classList.add("active");

}

function submitOrder(event){

    event.preventDefault();


    let inputs = document.querySelectorAll(
        ".checkout-form input, .checkout-form textarea"
    );


    let order = {

        name: inputs[0].value,

        phone: inputs[1].value,

        email: inputs[2].value,

        comment: inputs[3].value,

        products: cart,

        date: new Date().toLocaleString()

    };


    let orders = JSON.parse(
        localStorage.getItem("orders")
    ) || [];


    orders.push(order);


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    cart = [];


    localStorage.removeItem("cart");


    document.getElementById("cart-count").innerHTML = 0;



    document.getElementById("cart-panel").innerHTML = `


<div class="cart-overlay" onclick="closeCart()"></div>


<div class="cart-box">


<div class="cart-header">

<h2>
Спасибо за заказ!
</h2>

<span onclick="closeCart()">×</span>

</div>


<p>
Мы свяжемся с вами в ближайшее время.
</p>


<button class="checkout" onclick="closeCart()">

Продолжить покупки

</button>


</div>


`;


}

function openOrder(product){

document.getElementById("order-window").style.display = "flex";


document.getElementById("order-product").innerHTML =
"Вы выбрали: " + product;

}

function closeOrder(){

document.getElementById("order-window").style.display = "none";

}



// fetch("data/products.csv")
// .then(response => {

//     console.log("Ответ файла:", response);

//     return response.text();

// })
// .then(data => {

//     console.log("Содержимое CSV:", data);

// })
// .catch(error => {

//     console.log("Ошибка:", error);

// });
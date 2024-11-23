let products = [];
let str = '';
let cartProducts = [];

const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartListContent = document.querySelector('.shoppingCart-table tbody')

let totalPrice = document.querySelector('.totalPrice');

function getproducts(){
    axios(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`)
    .then(function(response){
        products = response.data.products;
        renderData(products);
    })
    .catch(function(error){
        alert(error.response.data.message);
    })
}

function renderData(data){
    str = ''
    data.forEach(item =>{
        str += `<li class="productCard">                
                    <h4 class="productType">新品</h4>
                    <img src="${item.images}" alt="">
                    <a href="#" class="addCardBtn" data-id='${item.id}'>加入購物車</a>
                    <h3>${item.title}</h3>
                    <del class="originPrice">NT$${item.origin_price}</del>
                    <p class="nowPrice">NT$${item.price}</p>
                </li> `
        productWrap.innerHTML = str;
    })
}

function init(){
    getproducts();
    getCartList();
}

productSelect.addEventListener('change',function(){
    let productsSelectList = [];
    productSelect.value === '全部' ? productsSelectList = products : productsSelectList = products.filter(item => productSelect.value === item.category);
    renderData(productsSelectList);
})

function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
        .then(function(response){
            str = ''
            cartProducts = response.data.carts;
            cartProducts.forEach(item=>{
                str += `<tr>
                            <td>
                                <div class="cardItem-title">
                                    <img src="${item.product.images}" alt="">
                                    <p>${item.product.title}</p>
                                </div>
                            </td>
                            <td>${item.product.price}</td>
                            <td>${item.quantity}</td>
                            <td>${item.product.price*item.quantity}</td>
                            <td class="discardBtn">
                                <a href="#" class="material-icons" data-id='${item.id}'>
                                    clear
                                </a>
                            </td>
                        </tr>`
            })
            cartListContent.innerHTML = str ;
            totalPrice.textContent = `NT$${response.data.finalTotal}`;
        })
        .catch(function(error){
            alert(error.response.data.message);
        })
}


productWrap.addEventListener('click',function(event){
    event.preventDefault();
    let productId = event.target.getAttribute('data-id');
    if(productId == null)return;
    let num = 1;
    cartProducts.forEach(item=>{
        if(item.product.id === productId) num = item.quantity +=1;
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,{
        data:{
            productId : productId,
            quantity : num
        }
    })
    .then(function(response){
        cartProducts = response.data.carts;
        getCartList();
    })
    .catch(function(error){
        alert(error.response.data.message);
    })
});

const cartList = document.querySelector('.shoppingCart-table');

cartList.addEventListener('click',function(event){
    event.preventDefault();
    cartId = event.target.getAttribute('data-id');
    if(cartId == null)return
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${cartId}`)
        .then(function(response){
            getCartList();
        })
        .catch(function(error){
            alert(error.response.data.message);
        })
})

const discardAllBtn = document.querySelector('.discardAllBtn');

discardAllBtn.addEventListener('click',function(){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
        .then(function(response){
            getCartList();
            alert(response.data.message);
        })
        .catch(function(error){
            alert(error.response.data.message);
        })
})

const orderInfoForm = document.querySelector('.orderInfo-form');
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const customertradeWay = document.querySelector('#tradeWay'); 
const orderInfoBtn = document.querySelector('.orderInfo-btn');

orderInfoBtn.addEventListener('click',function(event){
    event.preventDefault();
    let empty = false;
    const orderInput = document.querySelectorAll('.orderInfo-inputWrap input');
    const orderMessage = document.querySelectorAll('.orderInfo-message');

    orderInput.forEach((item,index)=>{
        if(item.value.toString().trim()===''){
            empty = true;
            orderMessage[index].setAttribute('style','display:block');
        }else{
            orderMessage[index].setAttribute('style','display:none');
        }
    })

    if(!empty){
        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,{
            data:{
                user:{
                    name : customerName.value,
                    tel : customerPhone.value,
                    email : customerEmail.value,
                    address : customerAddress.value,
                    payment : customertradeWay.value
                }
            }
        })
            .then(function(response){
                orderInfoForm.reset();
                cartListContent.innerHTML='';
                totalPrice.textContent ='NT$ 0';
                alert('訂單成功送出');
            })
            .catch(function(error){
                alert(error.response.data.message);
            })
    }
})


init();
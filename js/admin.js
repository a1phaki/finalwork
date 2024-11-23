let orderListData = [];
let str = '';
const orderList = document.querySelector('.orderPage-table tbody');
const orderTable = document.querySelector('.orderPage-table');

function getOrderList(){
    str = ''
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,config)
    .then(function(response){
        orderListData = response.data.orders;
        console.log(orderListData);
        orderListData.forEach(item=>{
            let productStr = '';
            item.products.forEach(item=>{
                productStr+=`<p>${item.title}(${item.quantity})</p>`
            });

            let status = '';
            status = item.paid == false ? '未處理' :  '已處理';
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`
            str += `<tr>
                        <td>${item.id}</td>
                        <td>
                            <p>${item.user.name}</p>
                            <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                            ${productStr}
                        </td>
                        <td>${orderTime}</td>
                        <td class="orderStatus">
                            <a href="#" data-id='${item.id}'>${status}</a>
                        </td>
                        <td>
                            <input type="button" class="delSingleOrder-Btn" data-id='${item.id}' value="刪除">
                        </td>
                    </tr> `;
        })
        orderList.innerHTML = str;
        chartCreate(orderListData);
    })
    .catch(function(error){
        alert(error.response.data.message);
    })

}

orderTable.addEventListener('click',function(event){
    event.preventDefault();
    let orderId = event.target.getAttribute('data-id');
    if(event.target.nodeName ==='A'){
        let status = event.target.textContent === '未處理' ?  true : false; 
        changeOrderStatus(orderId,status);
        return;
    }
    if(event.target.nodeName==='INPUT'){
        axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders/${orderId}`,config)
        .then(function(response){
            getOrderList();
        })
        .catch(function(error){
            alert(error.response.data.message);
        })
        return;
    }
})

function changeOrderStatus(id,status){
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,{
        data:{
            id : id,
            paid : status
        }
    },config)
        .then(function(response){
            getOrderList();
        })
        .catch(function(error){
            alert(error.response.data.message);
        })
}

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,config)
    .then(function(response){
        orderList.innerHTML = '';
        alert('已刪除所有訂單')
    })
    .catch(function(error){
        alert(error.response.data.message);
    })
})

function chartDataUpdate(data){
    let chartData = [];
    let productsList = [];
    data.forEach(items=>{
        items.products.forEach(products =>{
            let existingProduct = productsList.find(item => item.product === products.title);
            if(existingProduct){
                existingProduct.quantity += products.quantity;
                existingProduct.totalPrice = existingProduct.quantity * products.price;
            }else{
                productsList.push({product : products.title ,quantity:products.quantity,totalPrice:products.quantity*products.price});
            }
        })
    })
    productsList.sort((a, b) => b.totalPrice - a.totalPrice);
    chartData = productsList.slice(0,3);
    let othersPrice = productsList.slice(3).reduce((sum,item)=>sum + item.totalPrice,0);
    if(othersPrice>0){
        chartData.push({product : '其他',totalPrice:othersPrice});
    }
    return chartData.map(item=>[item.product,item.totalPrice]);
}

function chartCreate(data){
    let chartData = chartDataUpdate(data);
    chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: chartData,
        },
        color:{
            pattern:["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]
        }
    });
}
function init(){
    getOrderList();
}
init();

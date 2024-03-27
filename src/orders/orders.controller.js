const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// TODO: Implement the /orders handlers needed to make the tests pass
//create order
function create(req, res, next){
    const {data: {deliverTo, mobileNumber, dishes} = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({data: newOrder});
}

//read order
function read(req, res, next){
    res.json({ data: res.locals.order  });
}

//update order
function update(req, res, next){
    const {orderId} = req.params;
    const {data: {id, deliverTo, mobileNumber, dishes, status} = {} } = req.body;

    if(!id || orderId === id){
        const updatedOrder = {
            id: orderId,
            deliverTo,
            mobileNumber,
            dishes,
            status,
        }

        res.json({data: updatedOrder});
    }

    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    })
}

//delete order
function destory(req, res, next){
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    const removed = orders.splice(index, 1);
    res.sendStatus(204);
}

//list orders
function list(req, res){
    res.json({ data: orders })
}

//validation functions
function orderExists(req, res, next){
    const {orderId} = req.params; 
    const foundOrder = orders.find((order) => order.id === orderId);

    if (foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found: ${orderId}`,
    })
    next({
        status: 404,
        message: `Order: ${orderid} does not exists`,
    })
}

function deliverToExists(req, res, next){
    const { data: {deliverTo} = {}} = req.body;

    if(deliverTo){
        return next(); 
    }
    next({
        status: 400,
        message: "deliverTo",
    })
}

function mobileNumberExists(req, res, next){
    const {data: {mobileNumber} = {}} = req.body;

    if(mobileNumber){
        return next();
    }
    next({
        status: 400,
        message: "mobileNumber",
    })
}

function dishExists(req, res, next){
    const {data: {dishes} = {}} = req.body;

    if(!dishes){
        next({
            status: 400,
            message: "Order must contain dishes",
        })
    }
    else if(!Array.isArray(dishes) || dishes.length === 0){
        next({
            status: 400,
            message: "Orders must have at least one dish"
        })
    }
    return next();
}

function dishQuantityExists(req, res, next){
    const {data: {dishes} = {}} = req.body;
    const index = dishes.findIndex((dish) => !dish.quantity);

    if (index >= 0){
        next({
            status: 400,
            message: `Dish ${index} must have a quantity greater than zero`,
        })
    }
    return next();
}

function dishQuantityIsInteger(req, res, next){
    const { data: {dishes} = {}} = req.body;
    const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity))

    if(index >= 0){
        next({
            status: 400,
            message: `${index} quantity`,
        })
    }
    return next();
}

function statusExists(req, res, next){
    const {data: {status} = {}} = req.body;

    if(status === "pending" || status === "preparing" || status === "out-for-delivery"){
        return next();
    }
    next({
        status: 400,
        message: `Order must have a status`,
    })
}

function statusPending(req, res, next){
    const {order} = res.locals;

    if(order.status == "pending"){
        return next();
    }
    next({
        status: 400,
        message: "An order cannot be deleted unless it is pending",
    })
}

module.exports = {
    create: [
        deliverToExists,
        mobileNumberExists,
        dishExists,
        dishQuantityExists,
        dishQuantityIsInteger,
        create,
    ],
    read: [
        orderExists,
        read,
    ],
    update: [
        orderExists,
        deliverToExists,
        mobileNumberExists,
        dishExists,
        dishQuantityExists,
        dishQuantityIsInteger,
        statusExists,
        update,
    ],
    delete: [
        orderExists,
        statusPending,
        destory,
    ],
    list,   
}
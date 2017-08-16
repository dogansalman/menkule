module.exports = function(block){
    if (!Menkule.hasToken())
        return block.fn(this);
    else
        return block.inverse(this);
}
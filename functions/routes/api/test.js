module.exports = (app) => {
    app.get('/api/v1/helloWorld', (req, res)=>{
       res.send("Hello World!");
    });
};
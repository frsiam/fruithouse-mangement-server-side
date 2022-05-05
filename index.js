const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 4000;

const app = express();

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Hello....Assalamualaikum')
})


app.listen(port, () => {
    console.log('listening from', port)
})
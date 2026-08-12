require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("hireloop");
    console.log(`Connected to MongoDB database: ${db.databaseName}`);
    const jobCollection = db.collection('jobs')
    const companyCollection = db.collection('companies')

    app.get("/", (req, res) => {
      res.send("Hireloop server is running");
    });

    app.get('/api/jobs', async(req, res)=>{
      const query = {}
      if(req.query.companyId){
        query.companyId = req.query.companyId;
      }

      if (req.query.status) {
        query.status = req.query.status;
      }
      const cursor = jobCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)

    })

    app.post('/api/jobs', async(req, res)=> {
        const job = req.body
        const result = await jobCollection.insertOne(job)
        res.send(result)
    })


    //company related api
    app.post('/api/companies', async(req, res)=>{
      const company = req.body
      const result = await companyCollection.insertOne(company)
      res.send(result)
    })

    app.listen(port, () => {
      console.log(`Express server is running on http://localhost:${port}`);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);



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
    const userCollection = db.collection('user')

    app.get("/", (req, res) => {
      res.send("Hireloop server is running");
    });


    app.get('/api/users', async(req, res)=>{
      const cursor = userCollection.find()
      const result = await cursor.toArray()
      res.json(result)
    })

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
      res.json(result)

    })

    app.get('/api/jobs/:id', async(req, res)=>{
      const id = req.params.id
      const result = await jobCollection.findOne({_id: new ObjectId(id)})
      res.json(result)
    })

    app.post('/api/jobs', async(req, res)=> {
        const job = req.body;
        const newJob = {
          ...job,
          createdAt: new Date(),
        }
        const result = await jobCollection.insertOne(newJob)
        res.json(result)
    })


    //company related api
    app.get("/api/companies", async (req, res) => {
      const cursor = companyCollection.find();
      const result = await cursor.toArray();
      res.json(result);
    });


    app.post('/api/companies', async(req, res)=>{
      const company = req.body;
      const newCompany = {
        ...company,
        createdAt: new Date(),
      }
      const result = await companyCollection.insertOne(newCompany)
      res.send(result)
    })

app.get("/api/my/company", async (req, res) => {
  try {
    const { recruiterId } = req.query;

    if (!recruiterId) {
      return res.status(400).json({ message: "recruiterId required" });
    }

    const result = await companyCollection.findOne({ recruiterId });

    res.json(result); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

    app.listen(port, () => {
      console.log(`Express server is running on http://localhost:${port}`);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);



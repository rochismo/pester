import Express, {Application} from 'express';
import cors from 'cors';
const app: Application = Express();

app.use(cors());

app.get("/", (req, res) => res.send({ message: "Hello world"})); 

app.get("/fail-json", (req, res) => res.send("This should make the json parsing fail >:)"))
app.use((req, res) => res.status(404).json({ message: "Not found"}))

app.listen(3000);
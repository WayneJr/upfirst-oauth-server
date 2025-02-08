import { Application, json, urlencoded } from 'express';
import Routes from './routes';

export default class Server {
  constructor(app: Application) {
    this.config(app);
    new Routes(app);
  }

  public config(app: Application): void {
    app.use(urlencoded({ extended: true }));
    app.use(json());
  }
}

process.on('beforeExit', function (err) {
  console.error(err);
});

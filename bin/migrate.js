import { MessageFiles, Messages, Users } from '../models';

async function main() {
  await Users.sync({ alter: true });
  await Messages.sync({ alter: true });
  await MessageFiles.sync({ alter: true });

  process.exit(0);
}

main();

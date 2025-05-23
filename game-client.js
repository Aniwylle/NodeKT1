const zmq = require('zeromq');
const [,, min, max] = process.argv;

if (!min || !max) { // проверяем, переданы ли аргументы
  console.error('Usage: node game-client <min> <max>');  // если нет, выводим сообщение об ошибке
  process.exit(1);
}

const socket = new zmq.Request();
const randomNumber = Math.floor(Math.random() * (max - min + 1)) + parseInt(min); // генерируем случайное число в заданном диапазоне
console.log(`Загадано число: ${randomNumber}`);

(async () => {
  await socket.connect('tcp://localhost:5555');
  await socket.send(JSON.stringify({ range: `${min}-${max}` })); // отправляем диапазон чисел на сервер в формате JSON

  while (true) {
    const [msg] = await socket.receive();
    const message = JSON.parse(msg.toString());
    if (message.answer !== undefined) {
      const guess = message.answer;
      console.log(`Сервер: ${guess}`);
      if (guess < randomNumber) { // если предположение меньше загаданного числа
        await socket.send(JSON.stringify({ hint: 'more' })); // отправляем подсказку "больше".
      } else if (guess > randomNumber) { // и наоборот если больше загадонного числа
        await socket.send(JSON.stringify({ hint: 'less' })); // подсказка что меньше
      } else {
        console.log('Сервер угадал число!');
        socket.close();
        process.exit(0);
      }
    }
  }
})();

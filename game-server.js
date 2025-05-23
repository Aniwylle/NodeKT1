const zmq = require('zeromq');

const socket = new zmq.Reply();

(async () => {
  await socket.bind('tcp://*:5555');
  console.log('Готов к игре...');

  let min;
  let max;
  let currentGuess;

  for await (const [msg] of socket) { 
    const message = JSON.parse(msg.toString());

    if (message.range) { // если в сообщении есть диапазон чисел...
      [min, max] = message.range.split('-').map(Number); // ...извлекаем минимальное и максимальное значение диапазона
      currentGuess = Math.floor((min + max) / 2); // вычисляем первое предположение
      console.log(`Диапазон: ${min}-${max}`);
      await socket.send(JSON.stringify({ answer: currentGuess }));
    } else if (message.hint) {  // если в сообщении есть подсказка
      if (message.hint === 'more') { // если подсказка "больше"...
        min = currentGuess + 1; // ...обновляем минимальное значение диапазона
      } else if (message.hint === 'less') { // если подсказка "меньше"...
        max = currentGuess - 1;  // ...обновляем максимальное значение диапазона
      }
      currentGuess = Math.floor((min + max) / 2);  // вычисляем новое предположение
      console.log(`Новый диапазон: ${min}-${max}`);
      await socket.send(JSON.stringify({ answer: currentGuess }));
    }
  }
})();

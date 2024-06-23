// src/AudioPlayer.js
import React, { useEffect, useState } from 'react';
import Kafka from 'kafka-node';

const AudioPlayer = () => {
  const [text, setText] = useState('');
  const [audioURL, setAudioURL] = useState('');

  useEffect(() => {
    const client = new Kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
    const textConsumer = new Kafka.Consumer(
      client,
      [{ topic: 'text-stream', partition: 0 }],
      { autoCommit: true }
    );
    const audioConsumer = new Kafka.Consumer(
      client,
      [{ topic: 'audio-stream', partition: 0 }],
      { autoCommit: true }
    );

    textConsumer.on('message', (message) => {
      setText(message.value);
    });

    audioConsumer.on('message', (message) => {
      // Assuming the message.value contains a buffer for the audio data
      const buffer = Buffer.from(message.value);
      const blob = new Blob([buffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      // Cleanup previous audio URL to avoid memory leaks
      return () => URL.revokeObjectURL(url);
    });

    return () => {
      textConsumer.close(true, () => console.log('Text consumer closed'));
      audioConsumer.close(true, () => console.log('Audio consumer closed'));
      // Cleanup any existing audio URL on unmount
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return (
    <div>
      <div>{text}</div>
      {audioURL && <audio controls src={audioURL} />}
      console.log(audioURL)
    </div>
  );
};

export default AudioPlayer;

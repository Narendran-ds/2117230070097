const axios = require("axios");

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJuYXJlbmRyYW4ubC4yMDIzLmFpZHNAcml0Y2hlbm5haS5lZHUuaW4iLCJleHAiOjE3NzgwNDg3MDgsImlhdCI6MTc3ODA0NzgwOCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjRlZTM3ODNjLWZiOTctNGY3Mi1hM2JjLTk0YjE2NTFiNTYyZSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Im5hcmVuZHJhbiBsIiwic3ViIjoiMDYzYmZkMTYtNDFhMS00ZmYyLTlkMGYtNmQ4Nzk1Y2U3Y2Y2In0sImVtYWlsIjoibmFyZW5kcmFuLmwuMjAyMy5haWRzQHJpdGNoZW5uYWkuZWR1LmluIiwibmFtZSI6Im5hcmVuZHJhbiBsIiwicm9sbE5vIjoiMjExNzIzMDA3MDA5NyIsImFjY2Vzc0NvZGUiOiJCVENEcVQiLCJjbGllbnRJRCI6IjA2M2JmZDE2LTQxYTEtNGZmMi05ZDBmLTZkODc5NWNlN2NmNiIsImNsaWVudFNlY3JldCI6ImFZVFF2YXRaRmV5TlNYZGsifQ.Pgix1pLHERn1lxqw7JR6kJYn3RGEXVdJxhDsccsIsLc";

const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getPriorityScore(notification, oldestTimestamp, now) {
  const weight = TYPE_WEIGHT[notification.Type] || 0;
  const notifTime = new Date(notification.Timestamp).getTime();
  const recency = (notifTime - oldestTimestamp) / (now - oldestTimestamp);
  return weight + recency;
}

class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].score < this.heap[smallest].score) smallest = left;
      if (right < n && this.heap[right].score < this.heap[smallest].score) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

function getTopN(notifications, n) {
  const now = Date.now();
  const oldest = Math.min(...notifications.map((n) => new Date(n.Timestamp).getTime()));

  const heap = new MinHeap();

  for (const notif of notifications) {
    const score = getPriorityScore(notif, oldest, now);
    if (heap.size() < n) {
      heap.push({ score, notif });
    } else if (score > heap.peek().score) {
      heap.pop();
      heap.push({ score, notif });
    }
  }

  const result = [];
  while (heap.size() > 0) {
    result.push(heap.pop());
  }

  return result.reverse();
}

async function main() {
  const response = await axios.get("http://20.207.122.201/evaluation-service/notifications", {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  const notifications = response.data.notifications;
  console.log(`Fetched ${notifications.length} notifications\n`);

  const top10 = getTopN(notifications, 10);

  console.log("Top 10 Priority Notifications:");
  console.log("=".repeat(60));
  top10.forEach((item, index) => {
    console.log(`#${index + 1}`);
    console.log(`  ID        : ${item.notif.ID}`);
    console.log(`  Type      : ${item.notif.Type}`);
    console.log(`  Message   : ${item.notif.Message}`);
    console.log(`  Timestamp : ${item.notif.Timestamp}`);
    console.log(`  Score     : ${item.score.toFixed(4)}`);
    console.log("-".repeat(60));
  });
}

main().catch(console.error);
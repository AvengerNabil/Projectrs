import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(MyApp());
}

String token = "";

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: Home());
  }
}

class Home extends StatefulWidget {
  @override
  _HomeState createState() => _HomeState();
}

class _HomeState extends State<Home> {

  Future verify() async {
    var res = await http.get(
      Uri.parse("http://10.0.2.2:8000/verify?username=nabil")
    );

    var data = jsonDecode(res.body);

    if (data["success"]) {
      token = data["token"];
      print("Verified!");
    } else {
      print("Failed!");
    }
  }

  Future vote(int id) async {
    var res = await http.post(
      Uri.parse("http://10.0.2.2:8000/vote?token=$token&candidate_id=$id")
    );

    print(res.body);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("E-Voting")),
      body: Column(
        children: [
          ElevatedButton(
            onPressed: verify,
            child: Text("Verify Face"),
          ),
          ElevatedButton(
            onPressed: () => vote(0),
            child: Text("Vote Alice"),
          ),
          ElevatedButton(
            onPressed: () => vote(1),
            child: Text("Vote Bob"),
          ),
        ],
      ),
    );
  }
}
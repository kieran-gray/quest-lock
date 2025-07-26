use std::net::TcpStream;
use std::process::exit;

fn main() {
    if let Ok(_) = TcpStream::connect("localhost:8000") {
        println!("Connection successful");
        exit(0);
    } else {
        println!("Connection failed");
        exit(1);
    }
}
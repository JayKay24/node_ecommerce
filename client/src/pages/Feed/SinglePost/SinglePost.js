import React, { Component } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

class SinglePost extends Component {
  state = {
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphQlQuery = {
      query: `
      query FetchSinglePost($postId: ID!) {
        post(id: $postId) {
          title
          creator {
            name
          }
          imageUrl
          content
          createdAt
        }
      }
    `,
      variables: {
        postId,
      },
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphQlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching post failed!");
        }

        const {
          data: {
            post: {
              title,
              creator: { name: author },
              imageUrl,
              content,
              createdAt,
            },
          },
        } = resData;

        this.setState({
          title,
          author,
          image: "http://localhost:8080/" + imageUrl,
          date: new Date(createdAt).toLocaleDateString("en-US"),
          content,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;

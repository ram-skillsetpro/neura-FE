import { MentionCustomForm } from "core/components/mentions/mentions-custom-form";
import { Component } from "react";

import { userSearchListPrecontract } from "pages/pre-contract/pre-contract.redux";
import { AppDispatch } from "src/redux/create-store";
import "../pdf/style/tip.scss";

interface State {
  compact: boolean;
  text: string;
  emoji: string;
  commentTab: boolean;
}

interface Props {
  onConfirm: (comment: { text: string; emoji: string }) => void;
  onRedaction?: () => void;
  onOpen: () => void;
  onUpdate?: () => void;
  dispatch: AppDispatch;
  onSnippet?: () => void;
  onAddNewclause?: () => void;
  onAddToExistingClause?: () => void;
}

export class Tip extends Component<Props, State> {
  state: State = {
    compact: true,
    text: "",
    emoji: "",
    commentTab: false,
  };

  // for TipContainer
  componentDidUpdate(nextProps: Props, nextState: State) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();
    }
  }

  getUsers = async (query: string, callback: any) => {
    const users = (await this.props.dispatch(userSearchListPrecontract(query))) ?? [];
    const transformedUsers = users.map((user) => ({
      ...user,
      display: user.userName,
    }));
    callback(transformedUsers);
  };

  render() {
    const { onSnippet, onConfirm, onOpen, onAddNewclause, onAddToExistingClause, onRedaction } = this.props;
    const { compact, text, emoji, commentTab } = this.state;

    return (
      <div className="Tip">
        {compact ? (
          <div className="Tip__compact">
            <ul>
              <li
                onClick={() => {
                  onOpen();
                  this.setState({ compact: false });
                }}
              >
                Add To Comment
              </li>
              {
                onSnippet && <li
                  onClick={() => {
                    onSnippet && onSnippet();
                  }}
                >
                  Add & Share Excerpt
                </li>
              }
              {onRedaction && (
                <li
                  onClick={() => {
                    onRedaction();
                  }}
                >
                  Redact & Share
                </li>
              )}
              {
                onAddNewclause && <li
                  onClick={() => {
                    onAddNewclause && onAddNewclause();
                  }}
                >
                  Add New Clause
                </li>
              }
              {
                onAddToExistingClause && <li
                  onClick={() => {
                    onAddToExistingClause && onAddToExistingClause();
                  }}
                >
                  Add To Exisiting Clause
                </li>
              }
            </ul>
          </div>
        ) : (
          <form
            className="Tip__card"
            onSubmit={(event) => {
              event.preventDefault();
              onConfirm({ text, emoji });
            }}
          >
            <div>
              {/* <textarea
                style={{ width: "97%" }}
                placeholder="Your comment"
                autoFocus
                value={text}
                onChange={(event) => this.setState({ text: event.target.value })}
                ref={(node) => {
                  if (node) {
                    node.focus();
                  }
                }}
              /> */}
              <MentionCustomForm
                value={text}
                placeholder={"Add a comment"}
                data={this.getUsers}
                onChange={(value) => this.setState({ text: value })}
                mentionClassName={""}
                mentionInputClassName={"Tip__card__textarea"}
              />
              {/* <div>
                {["💩", "😱", "😍", "🔥", "😳", "⚠️"].map((_emoji) => (
                  <label key={_emoji}>
                    <input
                      checked={emoji === _emoji}
                      type="radio"
                      name="emoji"
                      value={_emoji}
                      onChange={(event) => this.setState({ emoji: event.target.value })}
                    />
                    {_emoji}
                  </label>
                ))}
              </div> */}
            </div>
            <div>
              <input type="submit" value="Save" />
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default Tip;

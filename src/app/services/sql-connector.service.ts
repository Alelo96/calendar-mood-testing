import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';
import {SQLite, SQLiteObject} from '@awesome-cordova-plugins/sqlite/ngx';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {
  createForm,
  createFormAnswers,
  createTables,
  createTags,
  createUserTags
} from '../../assets/createTableVariables';
import {addWarning} from "@angular-devkit/build-angular/src/utils/webpack-diagnostics";
import {isEmpty} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SqlConnectorService {
  databaseObj: SQLiteObject;
  tableForm = "form";
  readonly tableName: string = 'tags';
  private databaseReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private plt: Platform, private sqlite: SQLite, private http: HttpClient) {
    this.createDatabase();
  }

  async createDatabase() {
    await this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'calendar_mood.db',
        location: 'default'
      })
        .then(async (db: SQLiteObject) => {
          this.databaseObj = db;
          console.log("database created")
          await this.createTable();
        }).catch((e) => {
        console.log("ERROR CREATING DATABASE");
      });
    });
  }

  async createTable() {
    let tablesVariables = [createForm, createFormAnswers, createTags, createUserTags]
    for (const table of tablesVariables) {
      await this.databaseObj.executeSql(table, [])
        .then(async () => {
          console.log("tables created")
        }).catch((e) => {
          console.log("ERROR CREATING TABLE: " + table)
          console.log(e)
        });
    }

    console.log("TABLES CREATED")

    let tags = {
      t1: "alegre",
      t2: "triste",
      t3: "nostalgico",
      t4: "ansioso",
      t5: "tranquilo"
    }

    if (this.isEmpty(await this.getLastQuestions()[0])) {
      this.insertBasicForm()
    }
    if (this.isEmpty(await this.getLastTag()[0])) { //todo: comprovar si es isEmpty o lenght == 0
      this.insertBasicTag()
      console.log("BASIC TAG INSERTED")
    }

    // await this.insertUserTags(tags)

    console.log(await this.getAllRows(), "ALL ROWS") //ARRAY AMB L'ARRAY DE JSONS
    console.log(await this.getLastQuestions(), "LAST QUESTIONS")
    console.log(await this.getLastUserTags(), "LAST TAG")
  }

  async getAllRows() {
    return this.databaseObj.executeSql('SELECT * FROM form_answers;', [])
      .then((data) => {

        let jsonResult = [] //Creació array on aniran tots els resultats amb JSON
        for (let i = 0; i < data.rows.length; i++) { //Agafem tots els resultats
          jsonResult.push(data.rows.item(i))
        }
        return jsonResult;
      }).catch((e) => {
        console.log("ERROR GETTING ALL ROWS")
        console.log(e)
        return JSON.stringify(e);
      });
  }

  async insertRow() {
    this.databaseObj.executeSql(
      'INSERT INTO \'form\'(question1, question2, question3, question4, question5) values(?,?,?,?,?) '
      , ['a', 'b', 'c', 'd', 'e'])
      .then(async () => {
        console.log("data inserted");

      }).catch((e) => {
      if (e === 6) {
        console.log("category already exists")
      } else {
        console.log("ERROR INSERTING")
        console.log(e)
      }

    });
  }

  /*insertRow(){
    this.databaseObj.executeSql(
      "INSERT INTO 'form'(question1, question2, question3, question4, question5) values(?,?,?,?,?) "
      , ['a','b','c','d','e']);
  }*/

  async getLastQuestions() {
    return this.databaseObj.executeSql(`
      SELECT *
      FROM form
      WHERE id =
            (
              SELECT MAX(id)
              FROM form
            )
      ;
    `, [])
      .then((data) => {
        const questions = [];
        if (data.rows.length > 0) {
          questions.push(data.rows.item(0));
        }
        return questions;

      }).catch((e) => {
        console.log("ERROR GETTING LAST FORM")
        console.log(e)
      });
  }

  async getLastUserTags() {
    return this.databaseObj.executeSql(`
      SELECT *
      FROM user_tags
      WHERE id =
            (
              SELECT MAX(id)
              FROM user_tags
            )
      ;
    `, [])
      .then((data) => {
        const tags = [];
        if (data.rows.length > 0) {
          tags.push(data.rows.item(0));
        }
        return tags;

      }).catch((e) => {
        console.log("ERROR GETTING LAST TAG")
        console.log(e)
      });
  }

  async getLastTag() {
    return this.databaseObj.executeSql(`
      SELECT *
      FROM tags
      WHERE id =
            (
              SELECT MAX(id)
              FROM tags
            )
      ;
    `, [])
      .then((data) => {
        const tags = [];
        if (data.rows.length > 0) {
          tags.push(data.rows.item(0));
        }
        return tags;

      }).catch((e) => {
        console.log("ERROR GETTING LAST TAG")
        console.log(e)
      });
  }

  async getAllTags() {
    return this.databaseObj.executeSql(`
        SELECT *
        FROM tags;`
      , [])
      .then((data) => {
        let jsonResult = [] //Creació array on aniran tots els resultats amb JSON
        for (let i = 0; i < data.rows.length; i++) { //Agafem tots els resultats
          jsonResult.push(data.rows.item(i))
        }
        console.log(jsonResult, "JSONRESULT")
        return jsonResult;
      }).catch((e) => {
        console.log("ERROR GETTING ALL ROWS")
        console.log(e)
        return JSON.stringify(e);
      });
  }

  async getQuestionsFromId(id) {
    return this.databaseObj.executeSql(`
      SELECT *
      FROM form
      WHERE id = ?
      ;
    `, [id])
      .then((data) => {
        const questions = [];
        if (data.rows.length > 0) {
          questions.push(data.rows.item(0));
        }
        return questions;

      }).catch((e) => {
        console.log("ERROR GETTING QUESTION FROM ID")
        console.log(e)
      });
  }

  async getUserTagFromId(id) {
    return this.databaseObj.executeSql(`
      SELECT *
      FROM user_tags
      WHERE id = ?
      ;
    `, [id])
      .then((data) => {
        const tag = [];
        if (data.rows.length > 0) {
          tag.push(data.rows.item(0));
        }
        return tag;

      }).catch((e) => {
        console.log("ERROR GETTING TAG FROM ID")
        console.log(e)
      });
  }

  async getFormAnswerFromDate(date) {
    //todo: PASAR DATE CON EL REGEX HECHO
    return this.databaseObj.executeSql(`
      SELECT *
      FROM form_answers
      WHERE date = ?
      ;
    `, [date])
      .then(async (data) => {
        const dataId = data.rows.item(0).id;
        const questions = this.getQuestionsFromId(dataId);
        const userTags = this.getUserTagFromId(dataId);

        data.questions = questions
        data.userTags = userTags

        const answers = [];
        answers.push(data.rows.item(0));

        return answers;

      }).catch((e) => {
        console.log("ERROR GETTING ANSWER FROM DATE")
        console.log(e)
      });
  }

  async getAnswersFromDate(date) { //PASAR DATE CON REGEX HECHO
    return this.databaseObj.executeSql(`
      SELECT *
      FROM form_answers
      WHERE date = ?
      ;
    `, [date])
      .then(async (data) => {
        const answers = [];

        if (!this.isEmpty(data.row)) {
          console.log("he entrao")
          for (let i = 0; i < data.row.length; i++) {
            answers.push(data.rows.item(i));
          }
        }

        return answers;

      }).catch((e) => {
        console.log("ERROR GETTING ANSWER FROM DATE")
        console.log(e)
      });
  }

  async getTagQuantFromDate(date, tag) {
    //todo: recibir cantidad de veces que se repite un tag a partir de una fecha
    let answersFromDate: any;
    answersFromDate = await this.getAnswersFromDate(date);
    // let tagsIds = [];
    let count = 0

    for (const answer of answersFromDate) {
      await this.databaseObj.executeSql(`
        SELECT id
        FROM user_tags
        WHERE id = ?
          AND (tag1 = ? OR tag2 = ? OR tag3 = ? OR tag4 = ? OR tag5 = ?)
        ;
      `, [answer.id, tag, tag, tag, tag, tag])
        .then((data) => {
          if (data.rows.length > 0) count++;

        }).catch((e) => {
          console.log("ERROR GETTING TAG QUANTITY")
          console.log(e)
        });
    }
    return count
  }

  getMoodFromDate(date) {
    //todo: recibir mood a partir de fechas (mes?, hace for con dias?)
  }


  async insertAnswer(answers) {
    const lastForm = await this.getLastQuestions();
    const formId = lastForm[0].id;


    await this.insertUserTags(answers.tags) //todo: hacer insert de los tags del usuario

    const lastTag = await this.getLastUserTags();
    const userTagId = lastTag[0].id;

    this.databaseObj.executeSql(
      `
        INSERT INTO 'form_answers'(form_id, user_tags_id, date, percentage, answer1, answer2, answer3, answer4, answer5)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [formId, userTagId, answers.date, answers.percentage, answers.a1, answers.a2, answers.a3, answers.a4,
        answers.a5]);
  }

  async insertUserTags(tags) {
    this.databaseObj.executeSql(
      `
        INSERT INTO 'user_tags'(tag1, tag2, tag3, tag4, tag5)
        values (?, ?, ?, ?, ?);
      `, [tags.t1, tags.t2, tags.t3, tags.t4, tags.t5]).catch((e) => {
      console.log("ERROR:", e)
    });
  }

  async insertQuestions(questions) {
    this.databaseObj.executeSql(
      `
        INSERT INTO 'form'(question1, question2, question3, question4, question5)
        values (?, ?, ?, ?, ?);
      `, [questions.q1, questions.q2, questions.q3, questions.q4, questions.q5]);
  }

  async getElements() {
    const statement = `
      SELECT *
      FROM form
    `;

    return this.databaseObj.executeSql(statement);
  }

  fistInserts() {
    this.insertBasicForm()
    this.insertBasicTag()
  }

  async insertBasicForm() {
    this.databaseObj.executeSql(
      `
        INSERT INTO 'form'(question1, question2, question3, question4, question5)
        values (?, ?, ?, ?, ?);
      `, ["Què has fet avui?", "Què t'ha fet sentir així?", "Què sents que has fet bé?", "Què creus que pots millorar?",
        "Canviaries alguna cosa?"]
    );
  }

  async insertBasicTag() {
    let tagNames = ["tristesa", "alegria", "serenitat", "calidesa", "distanciament", "orgull", "amor", "fúria",
      "remordiment", "por", "confiança", "fàstic"]

    for (const name of tagNames) {
      this.databaseObj.executeSql(
        `
          INSERT INTO 'tags'(name)
          values (?);
        `, [name]
      );
    }
  }

  async insertTag(tag: String) {
    this.databaseObj.executeSql(
      `
        INSERT INTO 'tags'(name)
        values (?);`
      , [tag]
    ).then(() =>{
      console.log("INSTERT TAG WORKING")
    }).catch((e) =>{
      console.log("ERROR INSTERTING TAG")
      console.log(e)
    });
  }

  async deleteTag(tag: String) {
    this.databaseObj.executeSql(
      `
        DELETE
        FROM 'tags'
        WHERE name = (?);
      `,
      [tag]
    ).then(() =>{
      console.log("DELETE TAG WORKING")
    }).catch((e) =>{
      console.log("ERROR DELETING TAG")
      console.log(e)
    });
  }

  isEmpty(x) {
    if (x == undefined) {
      return true;
    }
    if (x == null) {
      return true;
    }
    if (x == '') {
      return true;
    }

    return false;
  }
}

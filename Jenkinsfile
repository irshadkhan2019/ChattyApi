pipeline {
  agent any
  parameters {
    choice(name: 'VERSION', choices: ['1.0','1.1','1.2'],description: '')
    booleanParam(name: 'executeTests',defaultValue: true ,description: '')
  }
  stages {
    
   stage("init") {
      steps {
        script {
          gv=load "script.groovy"
        }
      }
    }
    
    stage("build") {
      steps {
           script {
             gv.buildApp()
        }
      }
    }
    
    stage("test") {
      when {
        expression {
          params.executeTests
        }
      }
      
      steps {
        script {
          gv.testApp()
        }
      }
    }
    
    stage("deploy") {
      steps {
        script {
          env.ENV=input message: "Select the environment to deploy to",ok: "Done",parameters:[choice(name: 'VERSION', choices: ['dev','stage','prod'],description: '')]
          
          gv.deployApp()
          echo "Deploying to ${ENV}"
        }
      }
    }
  }
}

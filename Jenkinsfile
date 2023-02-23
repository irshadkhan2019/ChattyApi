def gv 

pipeline {
  agent any
  parameters {
    choice(name: 'VERSION', choices: ['1.0','1.1','1.2'],description: '')
    booleanParam(name: 'executeTests',defaultValue: true ,description: '')
  }
  tools {
    nodejs  'my-nodejs'
  }

  stages {
    
   stage("init") {
      steps {
        script {
          gv=load "script.groovy"
        }
      }
    }
    
    stage("build app") {
      steps {
           script {
             gv.buildJar()
        }
      }
    }

       stage("build image") {
      steps {
           script {
             gv.buildImage()
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
         gv.deployApp()
        }
      }
    }
  }
}

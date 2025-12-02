module Api
  module V1
    class NationalitiesController < ApplicationController
      def index
        render json: Nationality.order(:name).map { |n| { name: n.name } }
      end
    end
  end
end